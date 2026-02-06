# logging sheet

https://docs.google.com/spreadsheets/d/1Xaqm5eNIFRZVNP7EdBmw3V1o_ZpfO7kImVcXvFItnjA/edit?usp=sharing

backend: sheet & script https://docs.google.com/spreadsheets/d/1Xaqm5eNIFRZVNP7EdBmw3V1o_ZpfO7kImVcXvFItnjA/edit?usp=sharing

# prompt

(a series of prompts in one conversation with chatgpt) https://chatgpt.com/share/6985aa5b-e00c-800f-8dd7-9894b9e19848

key prompt snippets:

1. decising on the architecture
```
using the context of the two apps i have shown you, explain the easiest and most logical way to combine the logic of the two applications

key result:

i want to obtain a web app with the interface exactly the same as in my sentiment analysis project, with the same logic on the ML side of it.

for every "Analyze Random Review" button click, i want the backend logic for logging this event to a google sheets document  (i want four columns - Timestamp (ts_iso)
Review (which is randomly selected)
Sentiment (with confidence)
Meta (this includes all information from the client))

instructions:

do not write any code yet, just explain the goal file structure and where and how it will be stored and ran
```

2. writing the code
```
ok, your recommended option B that seems very valid. 

instructions:
please provide 
• the code needed in Code.gs on apps script side
• the code changes in app.js on the gitpub pages side
• the sequence of steps i need to perform to run my app
```

3. fixing access error

```
context:
• i have understood the symptoms and now i want a quick fix

instructions: 
• tell me exactly what code lines to change
• tell me the order of steps i should perform to check the behaviour
```


# existing apps

existing sentiment analysis app (example from the lecture):
ui: https://dryjins.github.io/aib/2026/l1/correct
repo & prompt: https://github.com/dryjins/aib/tree/main/2026/l1/correct


existing event logger app (build during the seminar):
ui: https://script.google.com/macros/s/AKfycbx9G6NyGPD-8zoVSUetzGvjxHMGQ4TtyPu1ZZiliCnuFdAsXthOX50CfnmLPqD5EVsn4Q/exec
sheet & script: https://docs.google.com/spreadsheets/d/1axwjKfNrFApvYmKGwCP3cavRn0FXqKqeTFGgydYlBrU/edit?usp=sharing
