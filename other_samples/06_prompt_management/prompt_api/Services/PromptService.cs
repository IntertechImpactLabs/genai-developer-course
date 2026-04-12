using PromptApi.Models;

namespace PromptApi.Services;

public class PromptService : IPromptService
{
    private readonly Dictionary<string, Prompt> _prompts = [];

    public Task<Prompt?> GetPromptAsync(string id)
    {
        _prompts.TryGetValue(id, out var prompt);
        return Task.FromResult(prompt);
    }

    public Task<List<Prompt>> GetAllPromptsAsync()
    {
        return Task.FromResult(_prompts.Values.ToList());
    }

    public Task<Prompt> CreatePromptAsync(CreatePromptRequest request)
    {
        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        var prompt = new Prompt
        {
            Id = id,
            Title = request.Title,
            Version = 1,
            Summary = request.Summary,
            Text = request.Text,
            Parameters = request.Parameters,
            CreatedAt = now,
            UpdatedAt = now
        };

        _prompts[id] = prompt;
        return Task.FromResult(prompt);
    }

    public Task<Prompt?> UpdatePromptAsync(string id, UpdatePromptRequest request)
    {
        if (!_prompts.TryGetValue(id, out var prompt))
        {
            return Task.FromResult<Prompt?>(null);
        }

        prompt.Title = request.Title;
        prompt.Summary = request.Summary;
        prompt.Text = request.Text;
        prompt.Parameters = request.Parameters;
        prompt.Version++;
        prompt.UpdatedAt = DateTime.UtcNow;

        return Task.FromResult<Prompt?>(prompt);
    }

    public Task<bool> DeletePromptAsync(string id)
    {
        return Task.FromResult(_prompts.Remove(id));
    }
}
