

/**
 * Capitalize la première lettre d'une chaîne de caractères
 * @param {string} str - La chaîne de caractères à capitaliser
 * @returns {string} - La chaîne de caractères avec la première lettre en majuscule
 */
export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();
}