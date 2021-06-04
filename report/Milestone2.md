# Milestone 2

The latest version is automatically built and made available on GitHub pages:
**[https://com-480-data-visualization.github.io/data-visualization-project-2021-ufa](https://com-480-data-visualization.github.io/data-visualization-project-2021-ufa)**

## Core Ideas

<p align="center">
  <img src="../mockup/mockup_detailed.png" alt="Sketch of the overall visualization" />
  <img src="../mockup/mockup_overview.png" alt="Legend" />
</p>

While all the parts can be treated separately, they will interact with each other to produce a rich user experience. We describe their behaviors below.

Our main idea is to show changes(most used words, categories, dominance of categories) throughout time. 
### Introduction modal (0)

When the user lands on the page, a modal will pop up to briefly explain our motivation and the goals of the visualization. This allows us to restrict the amount of textual description to a minimum, and provide more space to the graphics.

### Time slider (1)

A slider input that enables the user to select a year range.

### Weighted graph of all categories (2)

A weighted graph of all categories, with edges proportional to the number of papers having the two categories at the same time. The graph evolves depending on the selected time period. One category can be selected by clicking on it. Each category is colored according to its parent _field_ of study.

### Cloud of points representing the papers individually (3)

A cloud of points representing the papers individually, which position were determined using PCA on the title/abstract. Papers are highlighted only if they fall in the selected time range, and are either of the selected category, or the *hovered* one. Moreover, you can explore the papers either by searching or clicking one of the points. We are using PCA to see implicit relation between categories/papers. 

### Bar chart of similar categories (4)

A bar plot that shows the weighted proportion of categories related to the selected category on the graph. It will be only shown up to N similar categories to eliminate clustering and information noise. We are using the same color code as in the weighted graph for the bars.

### Line chart of papers published (5)

A line plot that shows the proportion of papers published in this category per time interval. If a time period is selected then the chart will be scaled for that period of time. A baseline will be included for comparison.

### Cloud of most used keywords (6)

Ranking of most used keywords in selected category or paper in this time period. It might not necessarily be a cloud of tags as we are still investigating other possibilities to display this information.

## Extra Ideas

### Chord diagram

The user will be able to switch between visualizing the categories or the fields (2), for a finer granularity control. Categories are displayed as a force-directed graph, while fields will be displayed as a chord diagram. The other plots will nicely adapt to this change.

### Multiple selection

Besides hovering the user should be able to select an arbitrary number of categories at the same time, in order to compare them against each other.

All of our graphs will adapt to multiple selection and chord diagram.

- Cloud of points will highlight the currently selected categories.
- Bar chart will consider the aggregation of all of the selected categories.
- Line chart will use the average of selected categories.
- Cloud of keywords will display the most frequent keywords among selected categories.

### Alternative visualization for secondary graphs (4, 5, 6)

<p align="center">
  <img src="../mockup/mockup_extra_ring.jpg" alt="Extra" width="200" />
</p>

When the user hovers one of the nodes of the weighted graph, the node will enlarge and transform to the above visualization. This circular graph combines charts (4, 5, 6). The outer ring represents the bar chart of similar categories and the proportion of categories are represented by the length of the bars. Inner bar graph replaces line chart of published papers. From center of the circle to the outer ring, year increases and the length of the bars represents the proportion of the papers published in that year. The remaining space will be used for the cloud of words. This alternative visualization idea makes the representation more compact.

## Tools

All visualizations will be built using **D3.js**, except the cloud of points (the 3<sup>rd</sup> core idea) which uses **three.js**, for performance reason. We are also using Tailwind for the layout and styling.
Generally speaking, we will make use of the introductory Javascript and D3 lectures. The lecture on *text visualization* will be of particular interest in order to enhance the cloud of tags (the 6<sup>th</sup> core idea). From the upcoming lectures we expect to discover more creative resources about how to represent our graph of categories (the 2<sup>nd</sup> core idea) in the lecture about *graphs* and how to deliver our story in a captivating manner in the *storytelling* lecture.
