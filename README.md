# Are We Inference Yet?

[Site](https://nordzilla.github.io/are-we-inference-yet/)

Tracks Mozilla inference work across the Core Machine Learning and Firefox
Translations components.

Project forked from: [bgrins/areweyet](https://github.com/bgrins/areweyet)

Chart embeds can opt into an **Unresolved backlog** line on the right-hand axis
by adding `&backlog=true` to their `burnup/index.html` URL (`&amp;backlog=true`
in HTML). This shows total bugs filed minus closed bugs: a rising line means
the backlog is growing; a falling line means it is shrinking. The existing
orange area is stacked above closed bugs, so its top edge represents total
filed and the gap between the two edges represents this backlog.
The hover table reports the orange edge as total bugs filed (open plus closed),
alongside closed bugs and, when enabled, unresolved backlog. The orange area
itself remains labeled Open Bugs in the legend because its thickness is the
open count.

The option defaults to off and is enabled for every whole-component chart
on the main page and subpages, including combined components and the
Translations platform charts. Charts tracking particular meta bugs leave it off.

Drag horizontally across any graph to zoom into a date range. Both vertical
axes scale automatically for the selected dates. Drag again to narrow the
range further, or select **Reset zoom** to restore the full date range.
