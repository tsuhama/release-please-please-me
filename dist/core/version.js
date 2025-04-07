"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStableVersion = toStableVersion;
exports.parseSemanticVersion = parseSemanticVersion;
const version_1 = require("release-please/build/src/version");
function toStableVersion(version) {
    return {
        minor: version.minor,
        major: version.major
    };
}
function parseSemanticVersion(versionValue) {
    const version = version_1.Version.parse(versionValue);
    return {
        major: version.major,
        minor: version.minor,
        patch: version.patch
    };
}
