process.env.GITHUB_REF = process.env.INPUT_GITHUB_REF;
require("./");
define("match-version", ["require", "exports", "fs", "@actions/core"], function (require, exports, fs, core) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (function (gitRef, prefix) {
        if (prefix === void 0) { prefix = ""; }
        var rawPackageJson = fs.readFileSync("package.json", "utf8");
        var packageJson = JSON.parse(rawPackageJson);
        var refsTags = "refs/tags/";
        if (!gitRef.startsWith(refsTags)) {
            throw new Error("Current commit is not tagged in git");
        }
        var version = packageJson.version;
        if (!prefix.startsWith(refsTags)) {
            prefix = "" + refsTags + prefix;
        }
        var prefixedVersion = "" + prefix + version;
        if (gitRef !== prefixedVersion) {
            throw new Error("Git tag (" + gitRef + ") does not match package.json version (" + version + ")");
        }
        core.info("Git tag (" + gitRef + ") matches package.json version (" + version + ")");
        core.setOutput("PACKAGE_VERSION", version);
        core.setOutput("TAG_VERSION", gitRef.substring(prefix.length));
    });
});
define("index", ["require", "exports", "match-version", "@actions/core"], function (require, exports, match_version_1, core) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    try {
        var prefix = process.env.INPUT_TAG_PREFIX
            ? process.env.INPUT_TAG_PREFIX
            : process.env.TAG_PREFIX;
        match_version_1.default(process.env.GITHUB_REF || "", prefix);
    }
    catch (error) {
        core.error(error.message);
        process.exit(1);
    }
});
define("match-version.test", ["require", "exports", "match-version", "mock-fs", "@actions/core"], function (require, exports, match_version_2, mock_fs_1, core) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    jest.mock("@actions/core", function () { return ({
        info: jest.fn(),
        setOutput: jest.fn(),
    }); });
    describe("matchVersion", function () {
        afterEach(function () {
            jest.clearAllMocks();
            mock_fs_1.default.restore();
        });
        describe(" when tag and version match", function () {
            var version = "0.0.0";
            beforeEach(function () {
                mock_fs_1.default({
                    "package.json": JSON.stringify({ version: version }),
                });
            });
            it("should not throw an error", function () {
                match_version_2.default("refs/tags/" + version);
            });
            it("should output the package version", function () {
                match_version_2.default("refs/tags/" + version);
                expect(core.setOutput).toHaveBeenCalledWith("PACKAGE_VERSION", version);
            });
            it("should output the tag version", function () {
                match_version_2.default("refs/tags/" + version);
                expect(core.setOutput).toHaveBeenCalledWith("TAG_VERSION", version);
            });
        });
        it("should throw an error when not on ref tag", function () {
            var version = "0.0.0";
            mock_fs_1.default({
                "package.json": JSON.stringify({ version: version }),
            });
            expect(function () { return match_version_2.default("refs/heads/master"); }).toThrow(/not tagged/);
        });
        it("should throw an error there is no package.json present", function () {
            mock_fs_1.default({});
            expect(function () { return match_version_2.default("refs/tags/some-tag"); }).toThrow(/no such file or directory/);
        });
        it("should throw an error when package.json is malformed", function () {
            mock_fs_1.default({
                "package.json": "hello there",
            });
            expect(function () { return match_version_2.default("refs/tags/some-tag"); }).toThrow(/Unexpected token/);
        });
        it("should not throw error when versions match with provided prefix", function () {
            var prefix = "v";
            var version = "0.0.0";
            mock_fs_1.default({
                "package.json": JSON.stringify({ version: version }),
            });
            match_version_2.default("refs/tags/" + prefix + version, prefix);
            expect(core.setOutput).toHaveBeenCalledWith("TAG_VERSION", version);
            expect(core.setOutput).toHaveBeenCalledWith("PACKAGE_VERSION", version);
            expect(core.setOutput).toHaveBeenCalledTimes(2);
        });
    });
});
//# sourceMappingURL=index.js.map