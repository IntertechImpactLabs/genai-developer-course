using PromptApi.Models;

namespace PromptApi.Services;

public interface IPromptService
{
    Task<Prompt?> GetPromptAsync(string id);
    Task<List<Prompt>> GetAllPromptsAsync();
    Task<Prompt> CreatePromptAsync(CreatePromptRequest request);
    Task<Prompt?> UpdatePromptAsync(string id, UpdatePromptRequest request);
    Task<bool> DeletePromptAsync(string id);
}
