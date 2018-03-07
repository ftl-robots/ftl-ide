import Path from 'path';

const FILE_TYPE_LANGUAGES = {
    '.java': 'java',
    '.js': 'javascript',
    '.c': 'cplusplus',
    '.cpp': 'cplusplus',
    '.txt': 'text',
    ".json": "json"
};

const fileUtils = {
    getFileLanguage: (filepath) => {
        try {
            const ext = Path.extname(filepath).toLowerCase();
            const lang = FILE_TYPE_LANGUAGES[ext] || 'text';
            return lang;
        }
        catch(ex) {
            return 'text';
        }
    },
};

export default fileUtils;