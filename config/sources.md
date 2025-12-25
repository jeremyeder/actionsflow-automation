# Signal Intelligence Sources

This file configures all signal sources for the daily digest.

Lines starting with `#` are comments and will be ignored.
Empty lines are ignored.

## GitHub Repositories

Monitor these repositories for new releases (including pre-releases).

Format: `owner/repo` (one per line)

Anthropic:

- anthropics/claude-code
- anthropics/anthropic-sdk-python

PyTorch Foundation:

- pytorch/pytorch
- ray-project/ray
- vllm-project/vllm
- microsoft/DeepSpeed
- meta-pytorch/monarch

CNCF:

- kubeflow/kubeflow

## Twitter Accounts

Monitor these Twitter accounts for recent posts.

Format: `@username` or `username` (one per line)

AI/ML Thought Leaders:

- karpathy
- ylecun
- AndrewYNg

AI Companies & Research:

- OpenAI
- AnthropicAI
- GoogleAI
- MetaAI

AI Engineering & Tools:

- simonw
- _philschmid
- weights_biases

Red Hat AI Community:

- RedHatAI

## Reddit Subreddits

Monitor these subreddits for hot posts.

Format: `subreddit_name` (one per line, without r/ prefix)

AI & LLM Communities:

- ClaudeAI
- LocalLLaMA
- MachineLearning

## People Watcher Target Repos

Monitor these repositories for contributor discovery and behavioral analysis.

Format: `owner/repo` (one per line, grouped by ecosystem)

PyTorch Foundation:

- pytorch/pytorch

CNCF (Cloud Native Computing Foundation):

- kubernetes/kubernetes

AI Tools:

- anthropics/claude-code
- anthropics/anthropic-sdk-python
- openai/openai-python

## HackerNews

Enabled by default - fetches top 30 stories from the HackerNews front page.

No configuration needed (uses HackerNews API directly).
