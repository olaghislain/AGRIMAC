import { ScrapingScheduler } from './scraping.scheduler';

describe('ScrapingScheduler', () => {
  it('does not run when the scheduler is disabled', async () => {
    const config = { get: jest.fn().mockReturnValue('false') };
    const repository = { activeSources: jest.fn() };
    const scraping = { runSource: jest.fn() };
    await new ScrapingScheduler(config as never, repository as never, scraping as never).runDaily();
    expect(repository.activeSources).not.toHaveBeenCalled();
  });

  it('runs only active external sources when enabled', async () => {
    const config = { get: jest.fn().mockReturnValue('true') };
    const repository = { activeSources: jest.fn().mockResolvedValue([{ id: 'source-1' }, { id: 'source-2' }]) };
    const scraping = { runSource: jest.fn().mockResolvedValue({ status: 'SUCCESS' }) };
    await new ScrapingScheduler(config as never, repository as never, scraping as never).runDaily();
    expect(scraping.runSource).toHaveBeenCalledWith('source-1');
    expect(scraping.runSource).toHaveBeenCalledWith('source-2');
  });
});
