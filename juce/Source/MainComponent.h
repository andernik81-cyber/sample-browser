#pragma once

#include <JuceHeader.h>
#include "LibraryScanner.h"

class MainComponent final : public juce::Component
{
public:
    MainComponent();
    ~MainComponent() override = default;

    void resized() override;

    // Accessor for the native functions registered on the webView options.
    LibraryScanner& getScanner() { return scanner; }

private:
    static juce::File findFrontendDistRoot();
    static juce::String mimeTypeForExtension (const juce::String& filename);
    static std::optional<juce::WebBrowserComponent::Resource> serveResource
        (const juce::File& distRoot, const juce::String& path);
    static juce::WebBrowserComponent::Options createOptions (MainComponent& self);

    juce::WebBrowserComponent webView;

    // Declared after webView, so it is destroyed first: the scanner stops its
    // worker thread (and drops pending events) while the webView still exists.
    // Emitted events are delivered to the React page via the JUCE native
    // interop; the scanner only ever emits from the message thread.
    LibraryScanner scanner { [this] (const juce::Identifier& eventId, const juce::var& payload)
                             { webView.emitEventIfBrowserIsVisible (eventId, payload); } };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};

