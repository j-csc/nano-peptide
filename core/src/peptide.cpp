#include "peptide.h"
#include <cmath>
#include <iomanip>
#include <sstream>
#include <unordered_map>

namespace nanopeptide {

// Standard bond lengths (Angstroms)
static constexpr double BOND_N_CA = 1.458;
static constexpr double BOND_CA_C = 1.523;
static constexpr double BOND_C_N = 1.329;
static constexpr double BOND_C_O = 1.231;
static constexpr double BOND_CA_CB = 1.521;

// Standard bond angles (radians)
static constexpr double ANGLE_N_CA_C = 111.2 * M_PI / 180.0;
static constexpr double ANGLE_CA_C_N = 116.2 * M_PI / 180.0;
static constexpr double ANGLE_C_N_CA = 121.7 * M_PI / 180.0;
static constexpr double ANGLE_CA_C_O = 120.8 * M_PI / 180.0;

static const std::unordered_map<char, std::string> RESIDUE_MAP = {
    {'A', "ALA"}, {'R', "ARG"}, {'N', "ASN"}, {'D', "ASP"}, {'C', "CYS"},
    {'E', "GLU"}, {'Q', "GLN"}, {'G', "GLY"}, {'H', "HIS"}, {'I', "ILE"},
    {'L', "LEU"}, {'K', "LYS"}, {'M', "MET"}, {'F', "PHE"}, {'P', "PRO"},
    {'S', "SER"}, {'T', "THR"}, {'W', "TRP"}, {'Y', "TYR"}, {'V', "VAL"},
};

Vec3 place_atom(const Vec3& a, const Vec3& b, const Vec3& c,
                double bond_length, double bond_angle, double dihedral) {
    Vec3 bc = (c - b).normalized();
    Vec3 ab = (b - a).normalized();
    Vec3 n = ab.cross(bc).normalized();
    Vec3 nbc = n.cross(bc);

    double theta = M_PI - bond_angle;
    double dx = bond_length * std::cos(theta);
    double dy = bond_length * std::sin(theta) * std::cos(dihedral);
    double dz = bond_length * std::sin(theta) * std::sin(dihedral);

    return c + bc * dx + nbc * dy + n * dz;
}

double dihedral_angle(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d) {
    Vec3 b1 = b - a;
    Vec3 b2 = c - b;
    Vec3 b3 = d - c;

    Vec3 n1 = b1.cross(b2);
    Vec3 n2 = b2.cross(b3);
    Vec3 m1 = n1.cross(b2.normalized());

    double x = n1.dot(n2);
    double y = m1.dot(n2);
    return std::atan2(y, x) * 180.0 / M_PI;
}

std::vector<Atom> generate_backbone(const std::string& sequence, SecondaryStructure ss) {
    double phi, psi;
    switch (ss) {
        case SecondaryStructure::Helix:
            phi = -57.0 * M_PI / 180.0;
            psi = -47.0 * M_PI / 180.0;
            break;
        case SecondaryStructure::Sheet:
            phi = -119.0 * M_PI / 180.0;
            psi = 113.0 * M_PI / 180.0;
            break;
        case SecondaryStructure::Coil:
        default:
            phi = -65.0 * M_PI / 180.0;
            psi = -40.0 * M_PI / 180.0;
            break;
    }
    double omega = M_PI; // trans peptide bond

    std::vector<Atom> atoms;

    Vec3 prevN = {0.0, 0.0, 0.0};
    Vec3 prevCA = {BOND_N_CA, 0.0, 0.0};
    Vec3 seed = {prevCA.x, prevCA.y + 1.0, prevCA.z};
    Vec3 prevC = place_atom(prevN, prevCA, seed, BOND_CA_C, ANGLE_N_CA_C, 0.0);

    for (size_t i = 0; i < sequence.size(); ++i) {
        char code = sequence[i];
        auto it = RESIDUE_MAP.find(code);
        if (it == RESIDUE_MAP.end()) continue;

        const std::string& res_name = it->second;
        int res_idx = static_cast<int>(i);

        Vec3 N, CA, C, O;

        if (i == 0) {
            N = prevN;
            CA = prevCA;
            C = prevC;
        } else {
            N = place_atom(prevCA, prevC, prevC, BOND_C_N, ANGLE_CA_C_N, psi);
            CA = place_atom(prevC, N, N, BOND_N_CA, ANGLE_C_N_CA, omega);
            C = place_atom(N, CA, CA, BOND_CA_C, ANGLE_N_CA_C, phi);
        }

        O = place_atom(CA, C, C, BOND_C_O, ANGLE_CA_C_O, M_PI);

        atoms.push_back({"N", res_name, res_idx, N, "N"});
        atoms.push_back({"CA", res_name, res_idx, CA, "C"});
        atoms.push_back({"C", res_name, res_idx, C, "C"});
        atoms.push_back({"O", res_name, res_idx, O, "O"});

        if (code != 'G') {
            Vec3 CB = place_atom(N, CA, C, BOND_CA_CB, ANGLE_N_CA_C, 122.0 * M_PI / 180.0);
            atoms.push_back({"CB", res_name, res_idx, CB, "C"});
        }

        prevN = N;
        prevCA = CA;
        prevC = C;
    }

    return atoms;
}

std::vector<BackboneAngles> extract_angles(const std::vector<Atom>& atoms) {
    // Group backbone atoms by residue
    struct ResidueAtoms {
        Vec3 N, CA, C;
        char code;
        bool has_N = false, has_CA = false, has_C = false;
    };

    std::unordered_map<int, ResidueAtoms> residues;
    // Reverse map from 3-letter to 1-letter
    std::unordered_map<std::string, char> rev_map;
    for (auto& [c, name] : RESIDUE_MAP) rev_map[name] = c;

    for (auto& atom : atoms) {
        auto& res = residues[atom.residue_index];
        if (!res.has_N && rev_map.count(atom.residue_name))
            res.code = rev_map[atom.residue_name];

        if (atom.name == "N") { res.N = atom.position; res.has_N = true; }
        else if (atom.name == "CA") { res.CA = atom.position; res.has_CA = true; }
        else if (atom.name == "C") { res.C = atom.position; res.has_C = true; }
    }

    // Sort residue indices
    std::vector<int> indices;
    for (auto& [idx, _] : residues) indices.push_back(idx);
    std::sort(indices.begin(), indices.end());

    std::vector<BackboneAngles> result;
    for (size_t i = 0; i < indices.size(); ++i) {
        auto& curr = residues[indices[i]];
        BackboneAngles ba;
        ba.residue_index = indices[i];
        ba.residue_code = curr.code;
        ba.phi = NAN;
        ba.psi = NAN;
        ba.omega = NAN;

        if (i > 0) {
            auto& prev = residues[indices[i - 1]];
            if (prev.has_C && curr.has_N && curr.has_CA && curr.has_C)
                ba.phi = dihedral_angle(prev.C, curr.N, curr.CA, curr.C);
        }
        if (i < indices.size() - 1) {
            auto& next = residues[indices[i + 1]];
            if (curr.has_N && curr.has_CA && curr.has_C && next.has_N)
                ba.psi = dihedral_angle(curr.N, curr.CA, curr.C, next.N);
        }

        result.push_back(ba);
    }

    return result;
}

std::string atoms_to_pdb(const std::vector<Atom>& atoms, const std::string& title) {
    std::ostringstream oss;
    oss << "HEADER    PEPTIDE" << std::endl;
    if (!title.empty())
        oss << "TITLE     " << title << std::endl;
    oss << "REMARK   1 GENERATED BY NANO-PEPTIDE C++ CORE" << std::endl;

    int serial = 1;
    for (auto& atom : atoms) {
        oss << "ATOM  "
            << std::setw(5) << serial++ << " "
            << std::setw(4) << std::left << (atom.name.size() < 4 ? " " + atom.name : atom.name)
            << std::right
            << " " << std::setw(3) << atom.residue_name
            << " A" << std::setw(4) << (atom.residue_index + 1) << "    "
            << std::fixed << std::setprecision(3)
            << std::setw(8) << atom.position.x
            << std::setw(8) << atom.position.y
            << std::setw(8) << atom.position.z
            << "  1.00  0.00          "
            << std::setw(2) << atom.element
            << std::endl;
    }
    oss << "END" << std::endl;
    return oss.str();
}

} // namespace nanopeptide
