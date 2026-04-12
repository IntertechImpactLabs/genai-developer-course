using PromptApi.Models;
using PromptApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddScoped<IPromptService, PromptService>();

var app = builder.Build();

// Routes
var promptGroup = app.MapGroup("/api/prompts")
    .WithName("Prompts");

// GET /api/prompts - Get all prompts
promptGroup.MapGet("/", GetAllPromptsAsync)
    .WithName("GetAllPrompts")
    .Produces<List<Prompt>>(StatusCodes.Status200OK);

// GET /api/prompts/{id} - Get a specific prompt
promptGroup.MapGet("/{id}", GetPromptAsync)
    .WithName("GetPrompt")
    .Produces<Prompt>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound);

// POST /api/prompts - Create a new prompt
promptGroup.MapPost("/", CreatePromptAsync)
    .WithName("CreatePrompt")
    .Produces<Prompt>(StatusCodes.Status201Created)
    .Accepts<CreatePromptRequest>("application/json");

// PUT /api/prompts/{id} - Update a prompt
promptGroup.MapPut("/{id}", UpdatePromptAsync)
    .WithName("UpdatePrompt")
    .Produces<Prompt>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Accepts<UpdatePromptRequest>("application/json");

// DELETE /api/prompts/{id} - Delete a prompt
promptGroup.MapDelete("/{id}", DeletePromptAsync)
    .WithName("DeletePrompt")
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status404NotFound);

app.Run();

// Endpoint handlers
static async Task<IResult> GetAllPromptsAsync(IPromptService service)
{
    var prompts = await service.GetAllPromptsAsync();
    return Results.Ok(prompts);
}

static async Task<IResult> GetPromptAsync(string id, IPromptService service)
{
    var prompt = await service.GetPromptAsync(id);
    return prompt is not null ? Results.Ok(prompt) : Results.NotFound();
}

static async Task<IResult> CreatePromptAsync(CreatePromptRequest request, IPromptService service)
{
    var prompt = await service.CreatePromptAsync(request);
    return Results.Created($"/api/prompts/{prompt.Id}", prompt);
}

static async Task<IResult> UpdatePromptAsync(string id, UpdatePromptRequest request, IPromptService service)
{
    var prompt = await service.UpdatePromptAsync(id, request);
    return prompt is not null ? Results.Ok(prompt) : Results.NotFound();
}

static async Task<IResult> DeletePromptAsync(string id, IPromptService service)
{
    var deleted = await service.DeletePromptAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
}
