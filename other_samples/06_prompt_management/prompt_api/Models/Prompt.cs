namespace PromptApi.Models;

public class Prompt
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Version { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public List<PromptParameter> Parameters { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
