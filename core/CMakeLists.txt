cmake_minimum_required(VERSION 3.16)
project(nano-peptide-core VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    src/peptide.cpp
    src/descriptors.cpp
    src/conformer.cpp
)

# Header files
set(HEADERS
    include/peptide.h
    include/descriptors.h
    include/conformer.h
)

# Check if building with Emscripten (WASM target)
if(EMSCRIPTEN)
    add_executable(peptide_core ${SOURCES} bindings/wasm_bindings.cpp)
    target_include_directories(peptide_core PRIVATE include)

    set_target_properties(peptide_core PROPERTIES
        OUTPUT_NAME "peptide_core"
        SUFFIX ".js"
    )

    target_link_options(peptide_core PRIVATE
        "SHELL:-s WASM=1"
        "SHELL:-s MODULARIZE=1"
        "SHELL:-s EXPORT_NAME='PeptideCore'"
        "SHELL:-s ALLOW_MEMORY_GROWTH=1"
        "SHELL:-s ENVIRONMENT='web,worker'"
        "SHELL:--bind"
        "SHELL:-O3"
    )
else()
    # Native library (for Python bindings via pybind11 later)
    add_library(peptide_core STATIC ${SOURCES})
    target_include_directories(peptide_core PUBLIC include)
endif()
