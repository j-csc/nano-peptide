#pragma once

#include <string>
#include <unordered_map>
#include <vector>

namespace nanopeptide {

struct PeptideProperties {
    int length;
    double molecular_weight;
    double net_charge;
    double isoelectric_point;
    double gravy;              // Grand average of hydropathy
    double instability_index;
    bool is_stable;
    std::unordered_map<char, int> composition;
};

/**
 * Compute physicochemical properties of a peptide sequence.
 */
PeptideProperties compute_properties(const std::string& sequence);

/**
 * Compute molecular weight from amino acid sequence.
 */
double compute_molecular_weight(const std::string& sequence);

/**
 * Compute net charge at given pH.
 */
double compute_charge_at_ph(const std::string& sequence, double ph = 7.0);

/**
 * Compute isoelectric point (pI) via bisection.
 */
double compute_isoelectric_point(const std::string& sequence);

/**
 * Compute GRAVY (grand average of hydropathy).
 */
double compute_gravy(const std::string& sequence);

} // namespace nanopeptide
