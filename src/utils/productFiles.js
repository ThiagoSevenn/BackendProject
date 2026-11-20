const fs = require('fs');
const path = require('path');
const createError = require('./errors');

const MEDIA_FOLDER = path.join(
    process.cwd(),
    'public',
    'media',
    'products'
);

// Monta a URL pública da imagem quando houver APP_URL configurada
function getPublicPath(filePath) {
    if (!filePath || !process.env.APP_URL || !filePath.startsWith('/')) {
        return filePath;
    }

    const appUrl = process.env.APP_URL.replace(/\/+$/, '');

    return `${appUrl}${filePath}`;
}

// Armazena o conteúdo ilustrativo da imagem
async function saveImage(image) {
    if (!image || typeof image.content !== 'string' || !image.content.trim()) {
        throw createError('O conteúdo da imagem é obrigatório.');
    }

    const content = image.content.trim();

    // Aceita URLs ou textos ilustrativos sem validar Base64
    return {
        path: content,
        createdFile: false
    };
}

// Remove um arquivo físico, caso exista
async function removeImageFile(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return;

    // Não tenta remover URLs externas
    if (/^https?:\/\//i.test(imagePath)) return;

    // Só permite remover arquivos da pasta de imagens dos produtos
    if (!imagePath.startsWith('/media/products/')) return;

    const relativePath = imagePath.replace(/^\/+/, '');
    const fullPath = path.resolve(process.cwd(), 'public', relativePath);
    const mediaFolder = path.resolve(MEDIA_FOLDER);

    // Impede acesso a arquivos fora da pasta de imagens
    if (!fullPath.startsWith(mediaFolder + path.sep)) return;

    try {
        await fs.promises.unlink(fullPath);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

module.exports = {
    saveImage,
    removeImageFile,
    getPublicPath
};
