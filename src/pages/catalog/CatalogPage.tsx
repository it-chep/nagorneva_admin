import type { CatalogResource } from '../../entities/catalog'
import { CatalogList } from '../../widgets/catalog-list'

export function CatalogPage({ resource }: { resource: CatalogResource }) { return <CatalogList resource={resource} /> }
