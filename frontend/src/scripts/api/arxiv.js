export const urlForPaper = id => `https://arxiv.org/abs/${id}`;

const URL_API_QUERY = 'https://export.arxiv.org/api/query';

const createUrl = (url, parameters = {}) => {
  const urlObj = new URL(url);
  Object.entries(parameters).forEach(([key, value]) => urlObj.searchParams.append(key, value));
  return urlObj;
};

const fetchXML = url => fetch(url)
  .then(response => response.text())
  .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'));

export const getPaperMetadata = id => fetchXML(createUrl(URL_API_QUERY, { 'id_list': id }));
