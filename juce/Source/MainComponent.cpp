#include "MainComponent.h"
#include "FolderPicker.h"

//==============================================================================
// Locates the frontend/dist directory.
//
// Works both in the build tree (exe lives several levels below the repo root)
// and in a deployed layout (frontend/dist next to the exe).
juce::File MainComponent::findFrontendDistRoot()
{
    auto dir = juce::File::getSpecialLocation (juce::File::currentExecutableFile).getParentDirectory();

    for (int i = 0; i < 8; ++i)
    {
        if (dir.getChildFile ("frontend/dist/index.html").existsAsFile())
            return dir.getChildFile ("frontend/dist");

        dir = dir.getParentDirectory();
    }

    auto cwd = juce::File::getCurrentWorkingDirectory();
    if (cwd.getChildFile ("frontend/dist/index.html").existsAsFile())
        return cwd.getChildFile ("frontend/dist");

    return {};
}

juce::String MainComponent::mimeTypeForExtension (const juce::String& filename)
{
    const auto ext = filename.fromLastOccurrenceOf (".", false, false).toLowerCase();

    if (ext == "html" || ext == "htm") return "text/html";
    if (ext == "js")                   return "application/javascript";
    if (ext == "mjs")                  return "application/javascript";
    if (ext == "css")                  return "text/css";
    if (ext == "svg")                  return "image/svg+xml";
    if (ext == "json")                 return "application/json";
    if (ext == "png")                  return "image/png";
    if (ext == "jpg" || ext == "jpeg") return "image/jpeg";
    if (ext == "webp")                 return "image/webp";
    if (ext == "woff")                 return "font/woff";
    if (ext == "woff2")                return "font/woff2";
    if (ext == "ico")                  return "image/x-icon";

    return "application/octet-stream";
}

// Serves a single file from frontend/dist.
//
// Path traversal protection: only plain relative paths without "..", backslashes,
// drive letters or URL escapes are accepted, so a request can never leave distRoot.
std::optional<juce::WebBrowserComponent::Resource> MainComponent::serveResource
    (const juce::File& distRoot, const juce::String& path)
{
    if (! distRoot.isDirectory())
        return std::nullopt;

    juce::String relative = path.trim().fromFirstOccurrenceOf ("/", false, false);

    if (relative.isEmpty())
        relative = "index.html";

    // --- path traversal guards ------------------------------------------------
    if (relative.contains ("..")                       // climbing out of dist
        || relative.containsChar ('\\')                // windows-style separators
        || relative.containsChar (':')                 // drive letters / schemes
        || relative.contains ("%2e") || relative.contains ("%2E")   // URL-escaped dots
        || relative.contains ("%2f") || relative.contains ("%2F"))  // URL-escaped slashes
    {
        return std::nullopt;
    }

    const auto file = distRoot.getChildFile (relative);

    // Second containment check: the resolved file must still live inside distRoot.
    const auto rootPath = distRoot.getFullPathName();
    const auto fullPath = file.getFullPathName();

    if (fullPath.length() < rootPath.length()
        || ! fullPath.substring (0, rootPath.length()).equalsIgnoreCase (rootPath))
    {
        return std::nullopt;
    }

    if (! file.existsAsFile() || file.isDirectory())
        return std::nullopt;

    juce::FileInputStream stream (file);

    if (stream.failedToOpen())
        return std::nullopt;

    const auto totalLength = stream.getTotalLength();

    if (totalLength < 0)
        return std::nullopt;

    std::vector<std::byte> bytes ((size_t) totalLength);

    if (totalLength > 0 && ! stream.read (bytes.data(), (int) totalLength))
        return std::nullopt;

    return juce::WebBrowserComponent::Resource { std::move (bytes), mimeTypeForExtension (file.getFileName()) };
}

juce::WebBrowserComponent::Options MainComponent::createOptions (MainComponent& self)
{
    const auto distRoot = findFrontendDistRoot();

    auto provider = [distRoot] (const juce::String& path)
        -> std::optional<juce::WebBrowserComponent::Resource>
    {
        return serveResource (distRoot, path);
    };

    // Native bridge: exposes the `chooseFolder` function to the JS/React side via
    // JUCE's stock `window.__JUCE__` interop. The react side calls it with no
    // arguments and receives either an absolute path string or a null/undefined
    // result when the user cancels.
    auto chooseFolder = [&self] (const juce::Array<juce::var>&,
                                 juce::WebBrowserComponent::NativeFunctionCompletion completion)
    {
        const auto path = FolderPicker::chooseFolder (self.getWindowHandle());
        completion (path.isEmpty() ? juce::var::undefined() : juce::var (path));
    };

    return juce::WebBrowserComponent::Options {}
        .withBackend (juce::WebBrowserComponent::Options::Backend::webview2)
        .withKeepPageLoadedWhenBrowserIsHidden()
        .withNativeIntegrationEnabled (true)
        .withNativeFunction ("chooseFolder", chooseFolder)
        .withResourceProvider (std::move (provider));
}

//==============================================================================
MainComponent::MainComponent()
    : webView (createOptions (*this))
{
    setOpaque (true);
    addAndMakeVisible (webView);

    webView.goToURL (juce::WebBrowserComponent::getResourceProviderRoot());
}

void MainComponent::resized()
{
    webView.setBounds (getLocalBounds());
}
