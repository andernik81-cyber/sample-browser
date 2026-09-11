#pragma once

#include <JuceHeader.h>

// Stage 12 — first-pass native filesystem scanner.
//
// Design constraints (project decisions):
//  - single background juce::Thread, no per-folder parallelism;
//  - in-memory results only (no database);
//  - no audio decoding: only file discovery, all technical metadata stays zero;
//  - deterministic stable IDs derived from the normalized absolute path;
//  - results are pushed to the React UI as small batches of native events
//    (never one huge payload for the whole library);
//  - scans are generation-tagged (scanId) so a cancelled old scan can never
//    deliver results on top of a newer one;
//  - offline/inaccessible library roots are reported as "offline" and are
//    never deleted; scanning continues with the remaining locations.
//
// The scanner is a pure native subsystem: it knows nothing about the React
// implementation. It hands (eventId, payload) pairs to the EmitFn callback,
// which the owner wires to WebBrowserComponent::emitEventIfBrowserIsVisible.
// The callback is always invoked on the JUCE message thread (AsyncUpdater).
class LibraryScanner : private juce::AsyncUpdater
{
public:
    // Called on the JUCE message thread with (eventId, payload).
    // Must not outlive the emitter (the owning MainComponent's webView).
    using EmitFn = std::function<void (const juce::Identifier&, const juce::var&)>;

    explicit LibraryScanner (EmitFn emitFn);
    ~LibraryScanner() override;

    // Starts a new scan generation. Any previous scan is cancelled first, so
    // only the newest generation can deliver results.
    void startScan (const juce::StringArray& rootPaths, bool recursive);

    // Requests cancellation and waits (bounded) for the worker thread to
    // finish. Safe to call from the message thread and from the destructor.
    void cancelScan();

private:
    struct Worker;

    void handleAsyncUpdate() override;

    // Thread-safe: may be called from the worker thread.
    void enqueue (const juce::Identifier& eventId, const juce::var& payload);

    EmitFn emit;

    // Scan configuration. Written on the message thread by startScan before
    // the worker is (re)created and only read afterwards by the worker.
    juce::StringArray currentRoots;
    bool currentRecursive = true;
    std::atomic<bool> scanCanceled { false };
    juce::Atomic<int> nextScanId { 0 };

    std::unique_ptr<Worker> worker;

    // Event queue filled by the worker, drained on the message thread.
    juce::CriticalSection queueLock;
    std::vector<std::pair<juce::Identifier, juce::var>> eventQueue;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (LibraryScanner)
};
