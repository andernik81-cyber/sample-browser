#pragma once

#include <JuceHeader.h>

// Thin native folder chooser for the Windows desktop app (JUCE 9.0.2, WebView2).
//
// Uses the standard Win32 shell dialog SHBrowseForFolderW + SHGetPathFromIDListW.
// Microsoft does not currently ship a richer first-class "directory only" native
// dialog; the modern BIF_USENEWUI flag renders the Vista-style folder browser, and
// BIF_RETURNONLYFSDIRS restricts the selection to real filesystem folders. This is
// the pragmatic, dependency-free Windows convention for picking only a directory.

class FolderPicker final
{
public:
    // Runs a modal native folder dialog (on the JUCE message thread) and returns the
    // absolute filesystem path of the chosen directory, or an empty String if the
    // user cancelled / the selection was not a valid filesystem folder.
    static juce::String chooseFolder (void* ownerWindowHandle);
};