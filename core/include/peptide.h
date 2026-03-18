#pragma once

#include <array>
#include <cmath>
#include <string>
#include <vector>

namespace nanopeptide {

struct Vec3 {
    double x, y, z;

    Vec3() : x(0), y(0), z(0) {}
    Vec3(double x, double y, double z) : x(x), y(y), z(z) {}

    Vec3 operator+(const Vec3& o) const { return {x + o.x, y + o.y, z + o.z}; }
    Vec3 operator-(const Vec3& o) const { return {x - o.x, y - o.y, z - o.z}; }
    Vec3 operator*(double s) const { return {x * s, y * s, z * s}; }

    double dot(const Vec3& o) const { return x * o.x + y * o.y + z * o.z; }
    Vec3 cross(const Vec3& o) const {
        return {y * o.z - z * o.y, z * o.x - x * o.z, x * o.y - y * o.x};
    }

    double length() const { return std::sqrt(x * x + y * y + z * z); }
    Vec3 normalized() const {
        double l = length();
        return l > 1e-10 ? Vec3{x / l, y / l, z / l} : Vec3{0, 0, 0};
    }
};

struct Atom {
    std::string name;
    std::string residue_name;
    int residue_index;
    Vec3 position;
    std::string element;
};

struct BackboneAngles {
    int residue_index;
    char residue_code;
    double phi;   // degrees, NaN if N-terminal
    double psi;   // degrees, NaN if C-terminal
    double omega; // degrees
};

enum class SecondaryStructure { Helix, Sheet, Coil };

/**
 * Generate idealized peptide backbone coordinates.
 * Uses standard bond lengths/angles and specified phi/psi.
 */
std::vector<Atom> generate_backbone(const std::string& sequence,
                                     SecondaryStructure ss = SecondaryStructure::Helix);

/**
 * Extract backbone dihedral angles from atom coordinates.
 */
std::vector<BackboneAngles> extract_angles(const std::vector<Atom>& atoms);

/**
 * Convert atoms to PDB format string.
 */
std::string atoms_to_pdb(const std::vector<Atom>& atoms, const std::string& title = "");

/**
 * Compute dihedral angle between four points (in degrees).
 */
double dihedral_angle(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d);

/**
 * Place atom using NeRF algorithm.
 */
Vec3 place_atom(const Vec3& a, const Vec3& b, const Vec3& c,
                double bond_length, double bond_angle, double dihedral);

} // namespace nanopeptide
