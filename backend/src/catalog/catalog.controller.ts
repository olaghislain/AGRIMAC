import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { SearchCatalogDto } from './dto/search-catalog.dto';
import { NearbyMaintainersDto } from './dto/nearby-maintainers.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search published products and services' })
  search(@Query() query: SearchCatalogDto) { return this.catalog.search(query); }

  @Get('nearby-maintainers')
  @ApiOperation({ summary: 'Find maintainers near a coordinate, sorted by distance' })
  nearbyMaintainers(@Query() query: NearbyMaintainersDto) { return this.catalog.nearbyMaintainers(query.latitude, query.longitude, query.radiusKm, query.limit); }

  @Get('categories')
  categories() { return this.catalog.categories(); }
}
