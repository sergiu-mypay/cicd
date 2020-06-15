/**
 * 
 * @param { {} } body - response body
 * @param { number? } statusCode  - statusCode [by default 200]
 * @param {{[key: string]: string}} headers - [by default {Access-Control-Allow-Origin': '*'}] 
 */
export const response = (body, statusCode, headers) => {

    if (typeof headers === 'undefined') {
        headers = { 'Access-Control-Allow-Origin': '*' };
    } else {
        headers['Access-Control-Allow-Origin'] = '*';
    }

    let response = {
        body: JSON.stringify(body),
        statusCode: statusCode ? statusCode  : 200,
        headers: headers
    };
    return response;
};