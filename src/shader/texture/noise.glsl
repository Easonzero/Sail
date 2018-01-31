const int NoisePermSize = 256;
int NoisePerm[] = int[2 * NoisePermSize](
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142,
    8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62,
    94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174,
    20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77,
    146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55,
    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
    132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100,
    109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147,
    118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28,
    42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
    155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
    178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
    191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
    181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66,
    215, 61, 156, 180, 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194,
    233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
    148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74,
    165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60,
    211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
    63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135,
    130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226,
    250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59,
    227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2,
    44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19,
    98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251,
    34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
    14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115,
    121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72,
    243, 141, 128, 195, 78, 66, 215, 61, 156, 180);

float Grad(int x, int y, int z, float dx, float dy, float dz) {
    int h = NoisePerm[NoisePerm[NoisePerm[x] + y] + z];
    h &= 15;
    float u = h < 8 || h == 12 || h == 13 ? dx : dy;
    float v = h < 4 || h == 12 || h == 13 ? dy : dz;
    return ((h & 1)!=0 ? -u : u) + ((h & 2)!=0 ? -v : v);
}

float noiseWeight(float t) {
    float t3 = t * t * t;
    float t4 = t3 * t;
    return 6.0 * t4 * t - 15.0 * t4 + 10.0 * t3;
}

float noise(float x, float y, float z) {
    int ix = int(floor(x)), iy = int(floor(y)), iz = int(floor(z));
    float dx = x - float(ix), dy = y - float(iy), dz = z - float(iz);

    ix &= NoisePermSize - 1;
    iy &= NoisePermSize - 1;
    iz &= NoisePermSize - 1;
    float w000 = Grad(ix, iy, iz, dx, dy, dz);
    float w100 = Grad(ix + 1, iy, iz, dx - 1.0, dy, dz);
    float w010 = Grad(ix, iy + 1, iz, dx, dy - 1.0, dz);
    float w110 = Grad(ix + 1, iy + 1, iz, dx - 1.0, dy - 1.0, dz);
    float w001 = Grad(ix, iy, iz + 1, dx, dy, dz - 1.0);
    float w101 = Grad(ix + 1, iy, iz + 1, dx - 1.0, dy, dz - 1.0);
    float w011 = Grad(ix, iy + 1, iz + 1, dx, dy - 1.0, dz - 1.0);
    float w111 = Grad(ix + 1, iy + 1, iz + 1, dx - 1.0, dy - 1.0, dz - 1.0);

    float wx = noiseWeight(dx), wy = noiseWeight(dy), wz = noiseWeight(dz);
    float x00 = mix(w000, w100, wx);
    float x10 = mix(w010, w110, wx);
    float x01 = mix(w001, w101, wx);
    float x11 = mix(w011, w111, wx);
    float y0 = mix(x00, x10, wy);
    float y1 = mix(x01, x11, wy);
    return mix(y0, y1, wz);
}

float noise(vec3 p){
    return noise(p.x,p.y,p.z);
}

float fbm(vec3 p, float omega, int maxOctaves) {
    int nInt = maxOctaves/2;

    float sum = 0.0, lambda = 1.0, o = 1.0;
    for (int i = 0; i < nInt; ++i) {
        sum += o * noise(lambda * p);
        lambda *= 1.99f;
        o *= omega;
    }

    float nPartial = float(maxOctaves - nInt);
    sum += o * smoothstep(0.3, 0.7, nPartial) * noise(lambda * p);
    return sum;
}

float turbulence(vec3 p, float omega, int maxOctaves) {
    int nInt = maxOctaves/2;

    float sum = 0.0, lambda = 1.0, o = 1.0;
    for (int i = 0; i < nInt; ++i) {
        sum += o * abs(noise(lambda * p));
        lambda *= 1.99;
        o *= omega;
    }

    float nPartial = float(maxOctaves - nInt);
    sum += o * mix(0.2, abs(noise(lambda * p)),smoothstep(0.3, 0.7, nPartial));
    for (int i = nInt; i < maxOctaves; ++i) {
        sum += o * 0.2;
        o *= omega;
    }
    return sum;
}