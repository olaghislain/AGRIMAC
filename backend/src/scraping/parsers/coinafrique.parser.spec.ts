import { CoinAfriqueBeninParser } from './coinafrique.parser';

describe('CoinAfriqueBeninParser', () => {
  it('maps the verified CoinAfrique category-card selectors without inventing detail fields', () => {
    const html = `<input id="gtm-category" value="Matériel Agricole"><div class="adcard__listing" data-view-origin="sub-category-page-listing"><article class="card ad__card round small hoverable"><a class="card-image ad__card-image" href="/annonce/materiel-agricole/motopompe-honda-5974771"><img class="ad__card-img" src="https://images.coinafrique.com/thumb_5974771_uploaded_image1.jpg"></a><div class="ad__card-description"><a href="/annonce/materiel-agricole/motopompe-honda-5974771">Motopompe HONDA GX200 WP30 3 pouces – Neuve</a></div><div class="ad__card-price"><a href="/annonce/materiel-agricole/motopompe-honda-5974771">85 000<span>CFA</span></a></div><div class="ad__card-location"><span>Cotonou, Bénin</span></div><div class="ad__card-timesince"><span class="time">1 mois</span></div><button class="card-fav" data-post-id="5974771" data-ad-category="Matériel Agricole"></button></article></div>`;
    const result = new CoinAfriqueBeninParser().parse(html);
    expect(result).toEqual([expect.objectContaining({ externalId: '5974771', name: 'Motopompe HONDA GX200 WP30 3 pouces – Neuve', category: 'Matériel Agricole', price: 85000, currency: 'XOF', location: 'Cotonou, Bénin', sourceUrl: 'https://bj.coinafrique.com/annonce/materiel-agricole/motopompe-honda-5974771', imageUrl: undefined })]);
    expect((result[0] as unknown as { sourceImageReference?: string }).sourceImageReference).toContain('images.coinafrique.com');
  });

  it('keeps a request-price card without inventing an amount', () => {
    const html = `<div class="adcard__listing" data-view-origin="sub-category-page-listing"><article class="card ad__card round small hoverable"><div class="ad__card-description"><a href="/annonce/materiel-agricole/machine-123">Machine agricole</a></div><div class="ad__card-price"><a href="/annonce/materiel-agricole/machine-123">Prix sur demande</a></div><div class="ad__card-location"><span>Parakou, Bénin</span></div><button class="card-fav" data-post-id="123" data-ad-category="Matériel Agricole"></button></article></div>`;
    expect(new CoinAfriqueBeninParser().parse(html)[0].price).toBeUndefined();
  });
});
