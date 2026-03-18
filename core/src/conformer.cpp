#include "conformer.h"
#include <algorithm>
#include <cmath>

namespace nanopeptide {

// Ramachandran-allowed regions (simplified as rectangles in phi/psi space)
struct Region {
    double phi_min, phi_max, psi_min, psi_max;
    double weight; // sampling probability
};

static const std::vector<Region> ALLOWED_REGIONS = {
    {-180, -20, -80, -10, 0.5},   // Alpha helix
    {-180, -80, 80, 180, 0.3},    // Beta sheet
    {-180, -50, 100, 180, 0.15},  // Polyproline II
    {40, 100, 20, 80, 0.05},      // Left-handed helix
};

std::vector<ConformerResult> generate_conformers(const std::string& sequence,
                                                  int num_conformers,
                                                  unsigned int seed) {
    std::mt19937 rng(seed);

    // Build cumulative distribution for regions
    std::vector<double> cum_weights;
    double total = 0;
    for (auto& r : ALLOWED_REGIONS) {
        total += r.weight;
        cum_weights.push_back(total);
    }

    std::uniform_real_distribution<double> uniform(0, total);

    std::vector<ConformerResult> results;

    for (int conf = 0; conf < num_conformers; conf++) {
        // Sample phi/psi for each residue
        std::vector<std::pair<double, double>> angles;
        for (size_t i = 0; i < sequence.size(); i++) {
            double r = uniform(rng);
            const Region* region = &ALLOWED_REGIONS[0];
            for (size_t j = 0; j < cum_weights.size(); j++) {
                if (r <= cum_weights[j]) {
                    region = &ALLOWED_REGIONS[j];
                    break;
                }
            }

            std::uniform_real_distribution<double> phi_dist(region->phi_min, region->phi_max);
            std::uniform_real_distribution<double> psi_dist(region->psi_min, region->psi_max);
            angles.push_back({phi_dist(rng) * M_PI / 180.0, psi_dist(rng) * M_PI / 180.0});
        }

        // Build backbone with sampled angles
        // (Simplified: using generate_backbone with fixed angles for now)
        auto atoms = generate_backbone(sequence, SecondaryStructure::Helix);
        double energy = evaluate_clashes(atoms);
        results.push_back({std::move(atoms), energy});
    }

    // Sort by energy
    std::sort(results.begin(), results.end(),
              [](const auto& a, const auto& b) { return a.energy < b.energy; });

    return results;
}

double evaluate_clashes(const std::vector<Atom>& atoms, double clash_distance) {
    double energy = 0;
    double clash_sq = clash_distance * clash_distance;

    for (size_t i = 0; i < atoms.size(); i++) {
        for (size_t j = i + 1; j < atoms.size(); j++) {
            // Skip atoms in same or adjacent residues
            if (std::abs(atoms[i].residue_index - atoms[j].residue_index) <= 1)
                continue;

            Vec3 diff = atoms[i].position - atoms[j].position;
            double dist_sq = diff.dot(diff);
            if (dist_sq < clash_sq) {
                energy += (clash_sq - dist_sq);
            }
        }
    }
    return energy;
}

} // namespace nanopeptide
