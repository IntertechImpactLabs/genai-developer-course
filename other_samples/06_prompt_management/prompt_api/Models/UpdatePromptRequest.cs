namespace PromptApi.Models;

public class UpdatePromptRequest
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public List<PromptParameter> Parameters { get; set; } = [];
}
