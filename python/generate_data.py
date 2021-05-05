import json
import os

import networkx as nx
import numpy as np
import pandas as pd

from sklearn.decomposition import TruncatedSVD, PCA
from sklearn.feature_extraction.text import TfidfVectorizer


# Download dataset from Kaggle (registration required): https://www.kaggle.com/Cornell-University/arxiv/download
input_file_arxiv = "../arxiv-metadata-oai-snapshot.json"
output_directory = "../frontend/public/data/"

# Optionally limit the maximum number of lines to read (set -1 to disable)
limit_max_lines = -1


def cached_or_compute(compute, filename, serialize, deserialize, no_cache=False):
    path_cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
    path_cached = os.path.join(path_cache, filename)
    if no_cache or not os.path.isfile(path_cached):
        print("Computing '%s'..." % filename)
        computed = compute()
        if not no_cache:
            print("Caching '%s' for further reuse..." % filename)
            serialize(path_cached, computed)
        return computed
    else:
        print("Loading cached '%s'..." % filename)
        return deserialize(path_cached)


def serialize_dataframe(filename, dataframe):
    dataframe.to_pickle(filename)


def deserialize_dataframe(filename):
    return pd.read_pickle(filename)


def serialize_network(filename, network):
    nx.write_gpickle(network, filename)


def deserialize_network(filename):
    return nx.read_gpickle(filename)


def serialize_numpy(filename, array):
    np.save(filename, array)


def deserialize_numpy(filename):
    return np.load(filename)


def read_file_to_dataframe(path_input_file_arxiv, max_lines=-1):
    lines = []
    with open(path_input_file_arxiv) as file:
        i = 0
        while max_lines < 0 or i < max_lines:
            line = file.readline()
            if not line:
                break
            lines.append(json.loads(line))
            i += 1

    df = pd.DataFrame(lines).set_index("id")
    df.update_date = pd.to_datetime(df.update_date, infer_datetime_format=True)
    return df


def compute_graph(df):
    adjacency = {}
    for m_cats in df.categories:
        m_cats_arr = m_cats.split(" ")
        for i, cat in enumerate(m_cats_arr):
            if cat not in adjacency:
                adjacency[cat] = {}
            for cat_it in m_cats_arr[i + 1:]:
                if cat_it not in adjacency[cat]:
                    adjacency[cat][cat_it] = {"weight": 1}
                else:
                    adjacency[cat][cat_it]["weight"] += 1
    g = nx.Graph(adjacency)
    return g


def compute_categories_counts(df):
    counts = {}
    for categories in df.categories:
        for category in categories.split(" "):
            if category not in counts:
                counts[category] = 0
            counts[category] += 1
    return counts


def compute_abstracts_pca(df):
    vectorizer = TfidfVectorizer(stop_words="english")
    abstracts_sparse = vectorizer.fit_transform(df.abstract)

    # First transformation (sparse to dense)
    n_components = 10
    svd = TruncatedSVD(n_components=n_components, random_state=1)
    abstracts_svd = svd.fit_transform(abstracts_sparse)

    # Final transformation (dense to 2D)
    return PCA(n_components=2).fit_transform(abstracts_svd)


def main():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    path_input_file_arxiv = os.path.join(current_directory, input_file_arxiv)
    path_output_directory = os.path.join(current_directory, output_directory)

    assert os.path.isfile(path_input_file_arxiv)
    assert os.path.isdir(path_output_directory)

    def dump_json(filename, data):
        with open(os.path.join(path_output_directory, filename), "w") as f:
            json.dump(data, f, separators=(',', ':'))

    np.random.seed(1)  # Reproducibility

    df = cached_or_compute(lambda: read_file_to_dataframe(path_input_file_arxiv, limit_max_lines),
                           "df.pkl", serialize_dataframe, deserialize_dataframe)

    g = cached_or_compute(lambda: compute_graph(df),
                          "categories_graph.pkl", serialize_network, deserialize_network)

    print("Writing categories graph data...")
    dump_json("categories_graph.json", nx.readwrite.json_graph.node_link_data(g))

    print("Writing categories counts...")
    dump_json("categories_counts.json", compute_categories_counts(df))

    pca = cached_or_compute(lambda: compute_abstracts_pca(df),
                            "pca.npy", serialize_numpy, deserialize_numpy)

    print("Writing (a subset of) papers...")
    n_papers = 10000
    paper_indices = np.arange(len(df))
    np.random.shuffle(paper_indices)
    selected_paper_indices = paper_indices[:n_papers]
    df_locs = df.iloc[selected_paper_indices]
    pca_locs = np.take(pca, selected_paper_indices, axis=0)
    selected_papers = pd.DataFrame({
        #"title": df_locs.title,
        "categories": df_locs.categories,
        "x": pca_locs[:, 0], "y": pca_locs[:, 1]
    })
    dump_json("papers.json", selected_papers.to_dict("index"))

    print("All done.")


if __name__ == "__main__":
    main()
