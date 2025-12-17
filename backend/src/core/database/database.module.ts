import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User,UserSchema } from "./schemas/user.schema";
import { Offer,OfferSchema } from "./schemas/offer.schema";
import { Product,ProductSchema } from "./schemas/product.schema";
import { OwnProfile,OwnProfileSchema } from "./schemas/profile.schema";
import { PawnshopProfile,PawnshopProfileSchema } from "./schemas/shopProfile.schema";
import { PawnInventoryItem,PawnInventoryItemSchema } from "./schemas/pawnInventory.schema";
import { Review, ReviewSchema } from "./schemas/reviews.schema";
import { PawnshopTerms, PawnshopTermsSchema } from "./schemas/pawnshop-term.schema";
import { NotificationSchema } from "./schemas/notifications.schema";

@Module({
    imports:[
        MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: OwnProfile.name, schema: OwnProfileSchema },
        { name: Product.name, schema: ProductSchema },
        { name: Offer.name, schema: OfferSchema },
        { name: PawnInventoryItem.name, schema: PawnInventoryItemSchema },
        { name: PawnshopProfile.name, schema: PawnshopProfileSchema },
        {name:Review.name, schema:ReviewSchema},
        {name:Notification.name, schema:NotificationSchema}
        ]),
    ],
    exports:[MongooseModule],
})
export class DatabaseModule {}