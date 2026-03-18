#pragma once

#include "peptide.h"
#include <random>
#include <vector>

namespace nanopeptide {

struct ConformerResult {
    std::vector<Atom> atoms;
    double energy; // simplified potential energy
};

/**
 * Generate multiple conformers by sampling phi/psi angles
 * from the Ramachandran-allowed regions.
 */
std::vector<ConformerResult> generate_conformers(const std::string& sequence,
                                                  int num_conformers = 10,
                                                  unsigned int seed = 42);

/**
 * Simple clash-based energy evaluation.
 * Returns a score where lower is better (fewer steric clashes).
 */
double evaluate_clashes(const std::vector<Atom>& atoms, double clash_distance = 2.0);

} // namespace nanopeptide
