namespace PromptApi.Models;

public class PromptParameter
{
    public string Name { get; set; } = string.Empty;
    public string? DefaultValue { get; set; }
    public string Description { get; set; } = string.Empty;
}
