# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Adina-Maria Ciubotaru | 322497 |
| Florian Cassayre | 269909 |
| Utku Görkem Ertürk | 321977 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

For our project, we decided to work on the [arXiv dataset](https://www.kaggle.com/Cornell-University/arxiv). This dataset contains metadata of all the 1.7 million articles uploaded on arxiv.org. The metadata in this dataset consists mainly of the following fields: title, abstract, authors list, categories, upload date and doi. From our exploratory data analysis work, we concluded that the dataset is of great quality: for most use cases the data is ready to be used right away. For text analysis tasks, a standard tokenization pipeline shall be applied in order to filter our symbols and other non-textual notations.

Remark: Anyone can publish articles on arXiv. For this project, we assume that most of the articles are serious, and thus that our analysis will be negligibly affected by nonsensical data. This information will be indicated in our final visualization.

### Problematic

In our project, we are interested in presenting an insightful analysis of the trends in academic publications. In particular, we will be providing an intuitive tool to explore the complex and immense space of scientific publications.

We are aiming to target two audiences jointly:
- One of them is the general public: the public doesn't always have a clear idea of how research works. With this project, we are hoping to provide them an engaging overview of the academical world, and a taste of how researchers collaborate together to create scientific results.
- The other target are academics people in general (researchers, students, ...): we reserve them more advanced tools that will allow them to get a deeper insight of the data; for instance visualizing the topics that are subject to active research, the transversality of the different fields, and more.

### Exploratory Data Analysis

Please refer to the following notebook: [`python/exploratory_data_analysis.ipynb`](python/exploratory_data_analysis.ipynb).

Our preliminary analysis served different purposes. First off, it allowed us to assess the data, evaluate how much preprocessing work was required before we could get started. In our case, the data required very little preprocessing, and we could get started right away. The second purpose was to validate the feasibility of our ideas; that is to verify that the data was rich enough, and that we could extract the patterns we wanted. 

The analysis we conducted includes several interesting tracks of research. We started simply by studying global indicators such as the number of papers published over time, the preferred day of the week for publishing, number of categories, etc. Curiously, we observed that the character length of both the title and the abstract was gradually and significantly increasing. Also, it seems that the authors are collaborating in larger groups for a single paper.
Unsurprisingly we also observed that the vocabulary and wording of the title and of the abstract were highly correlated to the category in which the paper was uploaded. Finally, we studied the transversality of the categories and made compelling observations.

In addition we initially wanted to also orient our analysis towards the EPFL research community (how researchers at EPFL collaborate together). However as our results were partly inconclusive, we decided to discard it.

### Related work

This dataset was initially posted on Kaggle and intended to be used for machine learning purposes; main use cases include training text analysis models such as word2vec to find the similarities between papers, and topic classification.
We found a relevant literature that studied scholar data, although the scope is different than ours; [A Survey of Scholarly Data Visualization](https://www.researchgate.net/publication/323715703_A_Survey_of_Scholarly_Data_Visualization). We couldn't find a major project that perform data analyses similar to the ones we performed. Thus we concluded that our approach was original.

Our main source of inspiration for this project comes from our personal experience, and to a lesser extent from the data visualization stories showcased during the lectures.

As an extra note, we didn't use this dataset before.

## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

