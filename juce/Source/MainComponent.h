#pragma once

#include <JuceHeader.h>

class MainComponent final : public juce::Component
{
public:
    MainComponent();
    ~MainComponent() override = default;

    void resized() override;

private:
    static juce::File findFrontendDistRoot();
    static juce::String mimeTypeForExtension (const juce::String& filename);
    static std::optional<juce::WebBrowserComponent::Resource> serveResource
        (const juce::File& distRoot, const juce::String& path);
    static juce::WebBrowserComponent::Options createOptions (MainComponent& self);

    juce::WebBrowserComponent webView;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
