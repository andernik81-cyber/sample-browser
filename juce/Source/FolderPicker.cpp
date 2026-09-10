#include "FolderPicker.h"

#ifdef JUCE_WINDOWS
    #include <windows.h>
    #include <shlobj.h>
#endif

juce::String FolderPicker::chooseFolder (void* ownerWindowHandle)
{
#ifdef JUCE_WINDOWS
    auto owner = static_cast<HWND> (ownerWindowHandle);

    wchar_t displayNameBuffer [MAX_PATH] {};

    BROWSEINFOW browseInfo {};
    browseInfo.hwndOwner      = owner;
    browseInfo.pidlRoot       = nullptr;
    browseInfo.pszDisplayName = displayNameBuffer;
    browseInfo.lpszTitle      = L"Choose a folder for the Sample Browser library";
    browseInfo.ulFlags        = BIF_RETURNONLYFSDIRS | BIF_USENEWUI;

    // On 64-bit builds the returned ITEMIDLIST is stored in the LPARAM-sized
    // result of SHBrowseForFolderW, so treat it as a pointer-sized value.
    const auto pidl = reinterpret_cast<ITEMIDLIST*> (SHBrowseForFolderW (&browseInfo));

    if (pidl == nullptr)
        return {};

    wchar_t pathBuffer [MAX_PATH] {};
    if (SHGetPathFromIDListW (pidl, pathBuffer) == TRUE)
    {
        const auto path = juce::String (pathBuffer);   // copies the wide string
        CoTaskMemFree (pidl);
        return path;
    }

    CoTaskMemFree (pidl);
#endif

    return {};
}