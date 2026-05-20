import { type SchemaTypeDefinition } from 'sanity'
import { vendorType } from './vendorType'
import { productType } from './productType'
import { courierType } from './courierType'
import { orderType } from './orderType'
import { categoryType } from './categoryType'
import { bannerType } from './bannerType'
import { serviceType } from './serviceType'
import { articleType } from './articleType'
import { customerType } from './customerType'
import { incubatorServiceType } from './incubatorServiceType'
import { incubatorSettingsType } from './incubatorSettingsType'

export const schemaTypes: SchemaTypeDefinition[] = [
  vendorType,
  productType,
  courierType,
  orderType,
  categoryType,
  bannerType,
  serviceType,
  articleType,
  customerType,
  incubatorServiceType,
  incubatorSettingsType,
]
