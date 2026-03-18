#include "descriptors.h"
#include <cmath>
#include <unordered_map>

namespace nanopeptide {

struct AAProperties {
    double mw;
    double charge;
    double hydrophobicity;
};

static const std::unordered_map<char, AAProperties> AA_PROPS = {
    {'A', {89.09, 0, 1.8}},   {'R', {174.20, 1, -4.5}},  {'N', {132.12, 0, -3.5}},
    {'D', {133.10, -1, -3.5}}, {'C', {121.16, 0, 2.5}},   {'E', {147.13, -1, -3.5}},
    {'Q', {146.15, 0, -3.5}},  {'G', {75.03, 0, -0.4}},   {'H', {155.16, 0.1, -3.2}},
    {'I', {131.17, 0, 4.5}},   {'L', {131.17, 0, 3.8}},   {'K', {146.19, 1, -3.9}},
    {'M', {149.21, 0, 1.9}},   {'F', {165.19, 0, 2.8}},   {'P', {115.13, 0, -1.6}},
    {'S', {105.09, 0, -0.8}},  {'T', {119.12, 0, -0.7}},  {'W', {204.23, 0, -0.9}},
    {'Y', {181.19, 0, -1.3}},  {'V', {117.15, 0, 4.2}},
};

static constexpr double WATER_MW = 18.015;

double compute_molecular_weight(const std::string& sequence) {
    double mw = 0;
    int count = 0;
    for (char c : sequence) {
        auto it = AA_PROPS.find(c);
        if (it != AA_PROPS.end()) {
            mw += it->second.mw;
            count++;
        }
    }
    return count > 0 ? mw - (count - 1) * WATER_MW : 0;
}

double compute_charge_at_ph(const std::string& sequence, double ph) {
    // pKa values for ionizable groups
    struct PKa { double nTerm, cTerm, D, E, C, Y, H, K, R; };
    static constexpr PKa pka = {9.69, 2.34, 3.65, 4.25, 8.18, 10.07, 6.00, 10.53, 12.48};

    auto cr = [&](double pk, int n, bool positive) -> double {
        double ratio = std::pow(10.0, positive ? pk - ph : ph - pk);
        return n * (positive ? ratio / (ratio + 1) : -ratio / (ratio + 1));
    };

    int nD = 0, nE = 0, nC = 0, nY = 0, nH = 0, nK = 0, nR = 0;
    for (char c : sequence) {
        switch (c) {
            case 'D': nD++; break; case 'E': nE++; break; case 'C': nC++; break;
            case 'Y': nY++; break; case 'H': nH++; break; case 'K': nK++; break;
            case 'R': nR++; break;
        }
    }

    return cr(pka.nTerm, 1, true) + cr(pka.cTerm, 1, false) +
           cr(pka.D, nD, false) + cr(pka.E, nE, false) +
           cr(pka.C, nC, false) + cr(pka.Y, nY, false) +
           cr(pka.H, nH, true) + cr(pka.K, nK, true) + cr(pka.R, nR, true);
}

double compute_isoelectric_point(const std::string& sequence) {
    double low = 0, high = 14;
    for (int i = 0; i < 200; i++) {
        double mid = (low + high) / 2.0;
        if (compute_charge_at_ph(sequence, mid) > 0)
            low = mid;
        else
            high = mid;
    }
    return (low + high) / 2.0;
}

double compute_gravy(const std::string& sequence) {
    double sum = 0;
    int count = 0;
    for (char c : sequence) {
        auto it = AA_PROPS.find(c);
        if (it != AA_PROPS.end()) {
            sum += it->second.hydrophobicity;
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

PeptideProperties compute_properties(const std::string& sequence) {
    PeptideProperties props;
    props.length = 0;
    props.molecular_weight = compute_molecular_weight(sequence);
    props.net_charge = compute_charge_at_ph(sequence, 7.0);
    props.isoelectric_point = compute_isoelectric_point(sequence);
    props.gravy = compute_gravy(sequence);

    // Composition
    for (char c : sequence) {
        if (AA_PROPS.count(c)) {
            props.composition[c]++;
            props.length++;
        }
    }

    // Simplified instability index
    double sum = 0;
    for (size_t i = 0; i + 1 < sequence.size(); i++) {
        sum += 1.0; // Simplified DIWV weight
    }
    props.instability_index = props.length > 0 ? (10.0 / props.length) * sum : 0;
    props.is_stable = props.instability_index < 40;

    return props;
}

} // namespace nanopeptide
