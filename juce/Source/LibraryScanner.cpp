#include "LibraryScanner.h"

namespace
{
//==============================================================================
// Source of truth for supported audio extensions (Stage 12). React does not
// re-decide which files are audio files; it only receives ready records.
// Decoding is NOT performed here — discovery only.
bool isSupportedAudioFile (const juce::File& file)
{
    const auto extension = file.getFileExtension().toLowerCase();   // includes the dot
    return extension == ".wav"
        || extension == ".aif"
        || extension == ".aiff"
        || extension == ".flac";
}

// Deterministic stable ID: FNV-1a 64-bit over the normalized absolute path
// (uniform separators + case folding, since Windows paths are case-insensitive).
// The same file always gets the same ID across rescans; Date/random are never used.
static juce::String stableId (juce_wchar prefix, const juce::String& absolutePath)
{
    const auto normalized = absolutePath.replaceCharacter (L'\\', L'/').toLowerCase();

    uint64 hash = 14695981039346656037ULL;   // FNV offset basis
    for (int i = 0; i < normalized.length(); ++i)
    {
        hash ^= (uint64) (uint32) normalized[i];
        hash *= 1099511628211ULL;            // FNV prime
    }

    return juce::String::charToString (prefix) + juce::String::toHexString ((int64) hash);
}

static juce::String stableFolderId (const juce::String& absolutePath) { return stableId (L'f', absolutePath); }
static juce::String stableSampleId (const juce::String& absolutePath) { return stableId (L's', absolutePath); }

static juce::var makeObject (std::initializer_list<std::pair<juce::Identifier, juce::var>> properties)
{
    auto* object = new juce::DynamicObject();
    for (const auto& property : properties)
        object->setProperty (property.first, property.second);
    return juce::var (object);
}

static const juce::Identifier scanStartedId  ("scanStarted");
static const juce::Identifier folderBatchId  ("folderBatch");
static const juce::Identifier scanProgressId ("scanProgress");
static const juce::Identifier scanCompleteId ("scanComplete");
static const juce::Identifier scanErrorId    ("scanError");

// Maximum number of records (folders + files) carried by one folderBatch event.
constexpr int kMaxRecordsPerBatch = 256;

} // namespace

//==============================================================================
// The single background worker. Holds its own generation state and a local
// batch buffer; only the final enqueue() touches the scanner's locked queue.
struct LibraryScanner::Worker : public juce::Thread
{
    explicit Worker (LibraryScanner& ownerRef)
        : juce::Thread ("SampleBrowserLibraryScanner"), owner (ownerRef) {}

    void run() override
    {
        // Each started scan gets a new unique generation id (atomic pre-increment
        // returns the new value), so React can discard events from superseded scans.
        scanId    = ++owner.nextScanId;
        recursive = owner.currentRecursive;
        rootPaths = owner.currentRoots;

        scanAll();

        // Always report completion, including user cancellation, so the UI can
        // leave the "scanning" state. If the scanner is being destroyed the
        // pending event is dropped safely by the AsyncUpdater machinery.
        owner.enqueue (scanCompleteId, makeObject ({
            { "scanId",       scanId },
            { "foldersFound", foldersFound },
            { "filesFound",   filesFound },
            { "canceled",     owner.scanCanceled.load() },
        }));
    }

    void scanAll()
    {
        // Pass 1: collect the unique root records this scan generation will handle
        // (duplicate library locations are skipped, offline status is detected here).
        juce::Array<juce::var> rootRecords;
        juce::StringArray uniquePaths;
        juce::StringArray seenIds;

        for (const auto& path : rootPaths)
        {
            if (threadShouldExit())
                return;

            const auto id = stableFolderId (path);

            if (seenIds.contains (id))
                continue;

            seenIds.add (id);
            uniquePaths.add (path);

            const auto directory = juce::File (path);
            const bool online = directory.isDirectory();
            const auto name = directory.getFileName().isEmpty() ? path : directory.getFileName();

            rootRecords.add (makeObject ({
                { "id",       id },
                { "name",     name },
                { "path",     path },
                { "parentId", juce::var() },
                { "status",   online ? juce::var ("online") : juce::var ("offline") },
            }));
        }

        // scanStarted must precede every folderBatch: React uses it to clear the
        // mock tree/files and switch to this scan generation. It is delivered on
        // the message thread through the same enqueue/AsyncUpdater path as all
        // other scanner events.
        owner.enqueue (scanStartedId, makeObject ({
            { "scanId", scanId },
            { "roots",  rootRecords },
        }));

        // Pass 2: scan online roots recursively, report offline ones and keep
        // scanning the remaining locations.
        for (const auto& path : uniquePaths)
        {
            if (threadShouldExit())
                return;

            const auto directory = juce::File (path);

            if (directory.isDirectory())
            {
                if (! scanFolder (directory, {}, recursive))
                    return;   // cancelled
            }
            else
            {
                // Offline location: report it, never delete it.
                owner.enqueue (scanErrorId, makeObject ({
                    { "scanId",  scanId },
                    { "rootId",  stableFolderId (path) },
                    { "path",    path },
                    { "message", "Library location is not accessible (offline)." },
                }));
            }
        }

        flush();
    }

    // Depth-first recursive enumeration. The folder record and the complete
    // list of files directly inside the folder are enqueued together, so the
    // File Table always receives whole folders. Direct files of a parent are
    // never mixed with files of its subfolders. A parent folder record is
    // always buffered before any of its descendants, so batches can never
    // arrive out of hierarchy order.
    bool scanFolder (const juce::File& directory, const juce::String& parentId, bool recursiveIn)
    {
        if (threadShouldExit())
            return false;

        const auto id = stableFolderId (directory.getFullPathName());
        ++foldersFound;

        juce::Array<juce::var> directFiles;

        juce::DirectoryIterator iterator (directory, false, "*",
                                          juce::File::findFilesAndDirectories | juce::File::ignoreHiddenFiles);

        while (iterator.next())
        {
            if (threadShouldExit())
                return false;

            const auto entry = iterator.getFile();

            if (entry.isDirectory())
            {
                if (recursiveIn && ! scanFolder (entry, id, recursiveIn))
                    return false;
            }
            else if (isSupportedAudioFile (entry))
            {
                ++filesFound;
                directFiles.add (makeObject ({
                    { "id",        stableSampleId (entry.getFullPathName()) },
                    { "name",      entry.getFileNameWithoutExtension() },
                    { "path",      entry.getFullPathName() },
                    { "extension", entry.getFileExtension().substring (1).toLowerCase() },
                    { "fileSize",  (int64) entry.getSize() },
                    { "folderId",  id },
                }));
            }
        }

        pendingFolders.add (makeObject ({
            { "id",       id },
            { "name",     directory.getFileName() },
            { "path",     directory.getFullPathName() },
            { "parentId", parentId.isEmpty() ? juce::var() : juce::var (parentId) },
            { "status",   juce::var ("online") },
        }));
        pendingFiles.addArray (directFiles);

        flushIfFull();
        return true;
    }

    void flushIfFull()
    {
        if (pendingFolders.size() + pendingFiles.size() >= kMaxRecordsPerBatch)
            flush();
    }

    // Pushes the current batch to the message thread (folders + files + progress).
    void flush()
    {
        if (pendingFolders.isEmpty() && pendingFiles.isEmpty())
            return;

        owner.enqueue (folderBatchId, makeObject ({
            { "scanId",       scanId },
            { "folders",      pendingFolders },
            { "files",        pendingFiles },
            { "foldersFound", foldersFound },
            { "filesFound",   filesFound },
        }));

        owner.enqueue (scanProgressId, makeObject ({
            { "scanId",       scanId },
            { "foldersFound", foldersFound },
            { "filesFound",   filesFound },
        }));

        pendingFolders.clear();
        pendingFiles.clear();
    }


    LibraryScanner& owner;
    int scanId = 0;
    bool recursive = true;
    juce::StringArray rootPaths;
    int foldersFound = 0, filesFound = 0;
    juce::Array<juce::var> pendingFolders, pendingFiles;
};

//==============================================================================
LibraryScanner::LibraryScanner (EmitFn emitFn)
    : emit (std::move (emitFn))
{
}

LibraryScanner::~LibraryScanner()
{
    // Stops the worker thread (bounded wait) and cancels any pending async
    // callback, so nothing can outlive the owning component.
    cancelScan();
}

void LibraryScanner::startScan (const juce::StringArray& rootPaths, bool recursive)
{
    // A repeated scan first stops the previous generation: no races, no
    // interleaved results from two scans.
    cancelScan();

    {
        const juce::ScopedLock lock (queueLock);
        eventQueue.clear();
    }

    currentRoots     = rootPaths;
    currentRecursive = recursive;
    scanCanceled     = false;

    worker = std::make_unique<Worker> (*this);
    worker->startThread (juce::Thread::Priority::normal);
}

void LibraryScanner::cancelScan()
{
    scanCanceled = true;

    if (worker != nullptr)
    {
        worker->signalThreadShouldExit();
        worker->stopThread (5000);
        worker.reset();
    }
}

void LibraryScanner::enqueue (const juce::Identifier& eventId, const juce::var& payload)
{
    {
        const juce::ScopedLock lock (queueLock);
        eventQueue.emplace_back (eventId, payload);
    }

    triggerAsyncUpdate();   // safe from background threads
}

void LibraryScanner::handleAsyncUpdate()
{
    std::vector<std::pair<juce::Identifier, juce::var>> items;

    {
        const juce::ScopedLock lock (queueLock);
        items.swap (eventQueue);
    }

    if (emit == nullptr)
        return;

    for (const auto& item : items)
        emit (item.first, item.second);
}
