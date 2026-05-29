# References Card Schema

`data/references/*/cards.json` stores fine-grained sales knowledge cards. These cards are reusable across projects and are intended for dynamic prompt retrieval.

Each card should follow this shape:

```json
{
  "id": "domain.unique_key",
  "domain": "product_value | grade_insights | parent_psychology | education_policy | study_habits | subject_diagnosis",
  "category": "一级主题",
  "subtopic": "二级主题",
  "tags": ["可检索标签"],
  "applies_to": {
    "grade": ["高一", "高二", "高三", "新高一", "高三上"],
    "subject": ["数学"],
    "score": ["550-620"],
    "audience": ["家长端", "学生端"],
    "type": ["维护话术", "蓄水激活", "软截杀", "硬截杀"]
  },
  "when_to_use": "什么场景召回",
  "source": ["原始文件路径或抽取文本文件"],
  "raw_points": ["源材料中可核验的要点"],
  "sales_insight": "从源材料提炼出的销转洞察",
  "prompt_snippet": "可直接拼进 system prompt 的短段落",
  "talk_tracks": ["销售可以怎么说"],
  "avoid": "禁忌或注意事项",
  "evidence": ["数据或背书；没有就写待补充"]
}
```

Retrieval suggestion:

- Match by `domain`, `tags`, `grade`, `subject`, `score`, `audience`, `type`.
- Prefer 2-4 cards per domain, not one giant paragraph.
- For repeated identical selections, rotate among same-score cards using `id` hash, random seed, or history.
- Keep prompt snippets short; use talk tracks only when the prompt budget allows.
