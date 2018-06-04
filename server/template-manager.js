const Path = require("path");
const fs = require("fs-extra");

/**
 * @typedef TemplateNewFileType
 * @property {string} fileType ID of this file type
 * @property {string} displayText Text to display on client
 * @property {string} extension File extension for this file type
 */

 /**
  * @typedef TemplateBuildInfo
  * @property {string} tbd
  */

/**
 * @typedef TemplateInfo
 * @property {string} templateName The name of this template
 * @property {string} templateDesc Extended description of the template
 * @property {string} srcDir Source folder to expose to clients
 * @property {TemplateNewFileType[]} newFileTypes Supported "new file" types
 * @property {object} buildInfo Build instructions for this project type
 */


class TemplateManager {
    constructor(templateDir) {
        this.d_templateDir = templateDir;

        // Map of templates
        this.d_templates = {};

        this.reinitialize();
    }

    // =============== PUBLIC API ===================

    reinitialize() {
        this.d_readyP = new Promise((resolve) => {
            this.__getListOfTemplates()
            .then(this.__getInfoForAllTemplates)
            .then(this.__makeTemplateList)
            .then((templateList) => {
                this.d_templates = {};

                // Populate the map
                templateList.forEach((templateInfo) => {
                    this.d_templates[templateInfo.templateName] = templateInfo;
                });

                resolve();
            });
        });

        return this.d_readyP;
    }

    get readyP() {
        return this.d_readyP;
    }

    /**
     * Get a map of template names to template info
     */
    getTemplatesP() {
        return this.d_readyP
            .then(() => {
                return this.d_templates;
            });
    }

    /**
     * Get a list of templates with corresponding information
     * @return {Promise<TemplateInfo[]>} Promise to the list of templates
     */
    getTemplatesAsListP() {
        return this.d_readyP
            .then(() => {
                var templateList = [];
                Object.keys(this.d_templates)
                    .forEach((k) => {
                        templateList.push(this.d_templates[k]);
                    });
                return templateList;
            });
    }

    /**
     * Syntactic sugar to get template information given a template name
     * @param {string} templateName
     * @return {Promise<TemplateInfo>} Promise to the template information, or null if invalid name
     */
    getTemplateInfoP(templateName) {
        return this.d_readyP
            .then(() => {
                return this.d_templates[templateName] || null;
            });
    }

    /**
     * Get a list of valid "new file" types for a particular project template
     * @param {string} templateName
     * @return {Promise<TemplateNewFileType[]>} Promise to the list of new file types, or empty array
     */
    getTemplateNewFileTypesP(templateName) {
        return this.d_readyP
            .then(() => {
                const templateInfo = this.d_templates[templateName];
                if (templateInfo && templateInfo.newFileTypes) {
                    return templateInfo.newFileTypes;
                }
                else {
                    return [];
                }
            });
    }

    // =============== INTERNAL HELPER METHODS ================

    /**
     * Helper method to read off a list of template folders from disk
     */
    __getListOfTemplates() {
        return fs.readdir(this.d_templateDir)
                .then((templateFiles) => {
                    var templateStatPromises = [];
                    templateFiles.forEach((templateFilename) => {
                        const filePath = Path.join(this.d_templateDir, templateFilename);
                        var statP = fs.stat(filePath)
                                        .then((fileStat) => {
                                            return {
                                                fileName: templateFilename,
                                                filePath: filePath,
                                                isDir: fileStat.isDirectory()
                                            };
                                        })
                                        .catch((err) => {
                                            return {
                                                fileName: templateFilename,
                                                filePath: filePath,
                                                isDir: false
                                            };
                                        });
                        templateStatPromises.push(statP);
                    });

                    return Promise.all(templateStatPromises);
                });
    }

    /**
     * Helper method to fetch info for each template from disk
     * @param {*} statResults
     */
    __getInfoForAllTemplates(statResults) {
        var templatePromises = [];
        statResults.forEach((statResult) => {
            if (statResult.isDir) {
                var templateDescPath = Path.join(statResult.filePath, "template.json");
                var templateDescP = fs.readJSON(templateDescPath)
                                        .then((templateInfo) => {
                                            return {
                                                templateName: statResult.fileName,
                                                templateDesc: templateInfo.description,
                                                srcDir: templateInfo.srcDir || ".",
                                                newFileTypes: templateInfo.newFileTypes,
                                                buildInfo: templateInfo.buildInfo
                                            };
                                        })
                                        .catch((err) => {
                                            return undefined;
                                        });
                templatePromises.push(templateDescP);
            }
        });

        return Promise.all(templatePromises);
    }

    /**
     * Helper method to generate the list of template info structs
     * @param {*} templatePResults
     */
    __makeTemplateList(templatePResults) {
        // Just generate an array of non-undefined template info structs
        var results = [];
        templatePResults.forEach((templateInfo) => {
            if (templateInfo) {
                results.push(templateInfo);
            }
        });

        return results;
    }
}

module.exports = TemplateManager;
