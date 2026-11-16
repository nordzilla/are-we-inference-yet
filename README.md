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

The option defaults to off and is enabled for all charts on the main page,
including the combined Core Machine Learning chart and Translations.
