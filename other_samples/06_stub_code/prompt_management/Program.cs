using PromptManagement.Services;
using PromptManagement.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddScoped<IPromptService, PromptService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// Map prompt management endpoints
app.MapPromptEndpoints();

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck")
    .WithSummary("Health check endpoint");

app.Run();
