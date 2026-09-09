#include <JuceHeader.h>
#include "MainComponent.h"

class SampleBrowserApplication final : public juce::JUCEApplication
{
public:
    const juce::String getApplicationName() override { return "Sample Browser"; }
    const juce::String getApplicationVersion() override { return "0.1.0"; }
    bool moreThanOneInstanceAllowed() override { return true; }

    void initialise(const juce::String&) override
    {
        mainWindow = std::make_unique<MainWindow>(getApplicationName());
    }

    void shutdown() override
    {
        mainWindow.reset();
    }

    void systemRequestedQuit() override
    {
        quit();
    }

    void anotherInstanceStarted(const juce::String&) override {}

private:
    class MainWindow final : public juce::DocumentWindow
    {
    public:
        explicit MainWindow(juce::String name)
            : DocumentWindow(std::move(name),
                             juce::Colour(0xff282828),
                             DocumentWindow::allButtons)
        {
            setUsingNativeTitleBar(true);
            setResizable(true, true);
            setContentOwned(new MainComponent(), true);
            centreWithSize(1000, 700);
            setVisible(true);
        }

        void closeButtonPressed() override
        {
            JUCEApplication::getInstance()->systemRequestedQuit();
        }
    };

    std::unique_ptr<MainWindow> mainWindow;
};

START_JUCE_APPLICATION(SampleBrowserApplication)
