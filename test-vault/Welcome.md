---
test: hello there how's ittt

---
#test


```meta-kanban
title: 41
description: my set of tasks
id: my-tasks
dv: |
  TABLE test 
  FROM #test
  SORT file.name ASC
property: status
columns:
  -
    - in-progress
    - In Progress
  - done
className: dataview
```


```dataview
TABLE test
FROM #test
SORT file.ctime ASC
```



