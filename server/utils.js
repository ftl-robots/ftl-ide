const REPLACEMENT_REQUIREMENTS = {
    "%NEW_JAVA_CLASS_PACKAGE%": {
        inputs: ["fileDirname"],
        generator: (inputs) => {
            var dirname = inputs[0];
            var splitDir = dirname.split("/");
            if (!splitDir[0]) {
                splitDir.splice(0, 1);
            }
            return splitDir.join(".");
        }
    },
    "%NEW_JAVA_CLASS_NAME%": {
        inputs: ["fileName"],
        generator: (inputs) => {
            return inputs[0];
        }
    },
    // ADD MORE AS NECESSARY
};

function generateTemplateReplacements(inputs) {
    var replacements = {};

    Object.keys(REPLACEMENT_REQUIREMENTS).forEach((replacementTag) => {
        var replacementData = REPLACEMENT_REQUIREMENTS[replacementTag];
        var inputArr = [];

        for (var i = 0; i < replacementData.inputs.length; i++) {
            if (inputs[replacementData.inputs[i]] !== undefined) {
                inputArr.push(inputs[replacementData.inputs[i]]);
            }
        }

        if (inputArr.length === replacementData.inputs.length) {
            replacements[replacementTag] = replacementData.generator(inputArr);
        }
    });


    return replacements;
}

module.exports = {
    generateTemplateReplacements: generateTemplateReplacements
};
