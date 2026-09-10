cmake_minimum_required(VERSION 3.22)

project(SampleBrowserNative VERSION 0.1.0 LANGUAGES C CXX)

set(JUCE_PATH "C:/JUCE" CACHE PATH "Path to the JUCE source tree")

if (NOT EXISTS "${JUCE_PATH}/CMakeLists.txt")
    message(FATAL_ERROR "JUCE was not found at '${JUCE_PATH}'.")
endif()

# --- WebView2 SDK ---
# JUCE 9.0.2's FindWebView2.cmake looks for a "Microsoft.Web.WebView2*" directory
# inside JUCE_WEBVIEW2_PACKAGE_LOCATION. Point it at the prepared SDK location.
# FORCE is required: the JUCE option() already wrote an empty cache entry for this
# variable on the previous configure, and set(CACHE) alone won't overwrite it.
if (NOT JUCE_WEBVIEW2_PACKAGE_LOCATION)
    set(JUCE_WEBVIEW2_PACKAGE_LOCATION "C:/WebView2SDK" CACHE PATH
        "Directory that contains the Microsoft.Web.WebView2 NuGet package" FORCE)
endif()

add_subdirectory("${JUCE_PATH}" JUCE)

# FindWebView2.cmake is shipped with JUCE in extras/Build/CMake. It creates the
# `juce::juce_webview2` interface target (include dirs + WebView2LoaderStatic.lib).
list(APPEND CMAKE_MODULE_PATH "${JUCE_CMAKE_UTILS_DIR}")
find_package(WebView2 REQUIRED)

juce_add_gui_app(SampleBrowserNative
    PRODUCT_NAME "Sample Browser"
    COMPANY_NAME "Ander"
    VERSION "0.1.0"
)

target_sources(SampleBrowserNative
    PRIVATE
        Source/Main.cpp
        Source/MainComponent.cpp
        Source/MainComponent.h
        Source/FolderPicker.cpp
        Source/FolderPicker.h
)

target_compile_features(SampleBrowserNative PRIVATE cxx_std_17)

target_compile_definitions(SampleBrowserNative
    PRIVATE
        JUCE_WEB_BROWSER=1
        JUCE_USE_WIN_WEBVIEW2=1
        JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1
        JUCE_DISPLAY_SPLASH_SCREEN=0
)

target_link_libraries(SampleBrowserNative
    PRIVATE
        juce::juce_gui_extra
        juce::juce_webview2
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
)

if (WIN32)
    # SHBrowseForFolderW / SHGetPathFromIDListW (folder picker) live in Shell32.
    target_link_libraries(SampleBrowserNative PRIVATE Shell32)
endif()

juce_generate_juce_header(SampleBrowserNative)
