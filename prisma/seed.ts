import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create staff
  const owner = await prisma.staff.create({
    data: {
      name: "店長",
      role: "OWNER",
      email: "admin@bonita.com",
      passwordHash: hashSync("admin123", 10),
      phone: "0912345678",
    },
  });

  const stylist = await prisma.staff.create({
    data: {
      name: "設計師 Amy",
      role: "STYLIST",
      email: "amy@bonita.com",
      passwordHash: hashSync("stylist123", 10),
      phone: "0923456789",
    },
  });

  await prisma.staff.createMany({
    data: [
      { name: "助理 小美", role: "ASSISTANT", email: "mei@bonita.com", passwordHash: hashSync("assistant123", 10) },
      { name: "助理 小花", role: "ASSISTANT", email: "hua@bonita.com", passwordHash: hashSync("assistant123", 10) },
      { name: "助理 小琳", role: "ASSISTANT", email: "lin@bonita.com", passwordHash: hashSync("assistant123", 10) },
    ],
  });

  // Create service categories and items
  const cutCat = await prisma.serviceCategory.create({
    data: { name: "剪髮", sortOrder: 1 },
  });
  const washCat = await prisma.serviceCategory.create({
    data: { name: "洗髮", sortOrder: 2 },
  });
  const dyeCat = await prisma.serviceCategory.create({
    data: { name: "染髮", sortOrder: 3 },
  });
  const permCat = await prisma.serviceCategory.create({
    data: { name: "燙髮", sortOrder: 4 },
  });

  // Cut items
  const cutItem = await prisma.serviceItem.create({
    data: { categoryId: cutCat.id, name: "一般剪髮", sortOrder: 1 },
  });
  await prisma.serviceVariant.create({
    data: { serviceItemId: cutItem.id, durationMinutes: 60, price: 500 },
  });

  const bangsCut = await prisma.serviceItem.create({
    data: { categoryId: cutCat.id, name: "瀏海修剪", sortOrder: 2 },
  });
  await prisma.serviceVariant.create({
    data: { serviceItemId: bangsCut.id, durationMinutes: 15, price: 100 },
  });

  // Wash items
  const washItem = await prisma.serviceItem.create({
    data: { categoryId: washCat.id, name: "一般洗髮", sortOrder: 1 },
  });
  await prisma.serviceVariant.create({
    data: { serviceItemId: washItem.id, durationMinutes: 30, price: 200 },
  });

  const headSpa = await prisma.serviceItem.create({
    data: { categoryId: washCat.id, name: "頭皮護理", sortOrder: 2 },
  });
  await prisma.serviceVariant.create({
    data: { serviceItemId: headSpa.id, durationMinutes: 45, price: 500 },
  });

  // Dye items - with hair length variants
  const fullDye = await prisma.serviceItem.create({
    data: { categoryId: dyeCat.id, name: "全染", sortOrder: 1 },
  });
  await prisma.serviceVariant.createMany({
    data: [
      { serviceItemId: fullDye.id, hairLength: "SHORT", durationMinutes: 90, price: 1500 },
      { serviceItemId: fullDye.id, hairLength: "MEDIUM", durationMinutes: 120, price: 2000 },
      { serviceItemId: fullDye.id, hairLength: "LONG", durationMinutes: 150, price: 2500 },
    ],
  });

  const rootDye = await prisma.serviceItem.create({
    data: { categoryId: dyeCat.id, name: "補染", sortOrder: 2 },
  });
  await prisma.serviceVariant.createMany({
    data: [
      { serviceItemId: rootDye.id, hairLength: "SHORT", durationMinutes: 60, price: 1000 },
      { serviceItemId: rootDye.id, hairLength: "MEDIUM", durationMinutes: 90, price: 1200 },
      { serviceItemId: rootDye.id, hairLength: "LONG", durationMinutes: 90, price: 1500 },
    ],
  });

  const highlight = await prisma.serviceItem.create({
    data: { categoryId: dyeCat.id, name: "挑染", sortOrder: 3 },
  });
  await prisma.serviceVariant.createMany({
    data: [
      { serviceItemId: highlight.id, hairLength: "SHORT", durationMinutes: 90, price: 1800 },
      { serviceItemId: highlight.id, hairLength: "MEDIUM", durationMinutes: 120, price: 2200 },
      { serviceItemId: highlight.id, hairLength: "LONG", durationMinutes: 150, price: 2800 },
    ],
  });

  // Perm items - with hair length variants
  const coldPerm = await prisma.serviceItem.create({
    data: { categoryId: permCat.id, name: "冷燙", sortOrder: 1 },
  });
  await prisma.serviceVariant.createMany({
    data: [
      { serviceItemId: coldPerm.id, hairLength: "SHORT", durationMinutes: 120, price: 1800 },
      { serviceItemId: coldPerm.id, hairLength: "MEDIUM", durationMinutes: 150, price: 2200 },
      { serviceItemId: coldPerm.id, hairLength: "LONG", durationMinutes: 180, price: 2800 },
    ],
  });

  const hotPerm = await prisma.serviceItem.create({
    data: { categoryId: permCat.id, name: "熱塑燙", sortOrder: 2 },
  });
  await prisma.serviceVariant.createMany({
    data: [
      { serviceItemId: hotPerm.id, hairLength: "SHORT", durationMinutes: 120, price: 2000 },
      { serviceItemId: hotPerm.id, hairLength: "MEDIUM", durationMinutes: 150, price: 2500 },
      { serviceItemId: hotPerm.id, hairLength: "LONG", durationMinutes: 180, price: 3200 },
    ],
  });

  // Products
  await prisma.product.createMany({
    data: [
      { name: "保濕洗髮精 300ml", brand: "BONITA", price: 450, stockQuantity: 20 },
      { name: "修護護髮素 250ml", brand: "BONITA", price: 380, stockQuantity: 15 },
      { name: "造型髮蠟 80g", brand: "BONITA", price: 350, stockQuantity: 10 },
      { name: "護髮油 100ml", brand: "BONITA", price: 520, stockQuantity: 12 },
      { name: "定型噴霧 200ml", brand: "BONITA", price: 300, stockQuantity: 8 },
    ],
  });

  // Schedule templates for the stylist (Mon-Sat, 10:00-20:00)
  for (let day = 1; day <= 6; day++) {
    await prisma.scheduleTemplate.create({
      data: {
        staffId: stylist.id,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "20:00",
        slotInterval: 30,
      },
    });
  }

  // Sample customers
  const cust1 = await prisma.customer.create({
    data: { name: "王小明", phone: "0911222333", email: "ming@example.com", gender: "M" },
  });
  const cust2 = await prisma.customer.create({
    data: { name: "李小美", phone: "0922333444", email: "mei@example.com", gender: "F", notes: "頭皮較敏感，避免使用含矽靈產品" },
  });
  const cust3 = await prisma.customer.create({
    data: { name: "張小華", phone: "0933444555", gender: "F" },
  });

  // Sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      bookingNo: "B20260410-001",
      customerId: cust1.id,
      staffId: stylist.id,
      bookingDate: "2026-04-10",
      startTime: "10:00",
      endTime: "11:00",
      totalDuration: 60,
      estimatedAmount: 500,
      status: "CONFIRMED",
    },
  });
  await prisma.bookingItem.create({
    data: {
      bookingId: booking1.id,
      serviceVariantId: (await prisma.serviceVariant.findFirst({ where: { serviceItem: { name: "一般剪髮" } } }))!.id,
      serviceName: "一般剪髮",
      categoryName: "剪髮",
      durationMinutes: 60,
      price: 500,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      bookingNo: "B20260410-002",
      customerId: cust2.id,
      staffId: stylist.id,
      bookingDate: "2026-04-10",
      startTime: "13:00",
      endTime: "15:00",
      totalDuration: 120,
      estimatedAmount: 2000,
      status: "PENDING",
    },
  });
  const fullDyeMedium = await prisma.serviceVariant.findFirst({
    where: { serviceItem: { name: "全染" }, hairLength: "MEDIUM" },
  });
  await prisma.bookingItem.create({
    data: {
      bookingId: booking2.id,
      serviceVariantId: fullDyeMedium!.id,
      serviceName: "全染",
      categoryName: "染髮",
      hairLength: "MEDIUM",
      durationMinutes: 120,
      price: 2000,
    },
  });

  // Sample completed order
  const order1 = await prisma.order.create({
    data: {
      orderNo: "O20260409-001",
      customerId: cust3.id,
      staffId: stylist.id,
      orderDate: "2026-04-09",
      serviceSubtotal: 2700,
      productSubtotal: 450,
      discountAmount: 0,
      totalAmount: 3150,
      paymentMethod: "CASH",
      status: "SETTLED",
      settledAt: new Date("2026-04-09T17:00:00"),
      createdBy: owner.id,
    },
  });
  const cutVariant = await prisma.serviceVariant.findFirst({ where: { serviceItem: { name: "一般剪髮" } } });
  const hotPermMedium = await prisma.serviceVariant.findFirst({
    where: { serviceItem: { name: "熱塑燙" }, hairLength: "MEDIUM" },
  });
  await prisma.orderServiceItem.createMany({
    data: [
      {
        orderId: order1.id,
        serviceVariantId: cutVariant!.id,
        serviceName: "一般剪髮",
        categoryName: "剪髮",
        durationMinutes: 60,
        unitPrice: 500,
        subtotal: 500,
        performedBy: stylist.id,
      },
      {
        orderId: order1.id,
        serviceVariantId: hotPermMedium!.id,
        serviceName: "熱塑燙",
        categoryName: "燙髮",
        hairLength: "MEDIUM",
        durationMinutes: 150,
        unitPrice: 2500,
        subtotal: 2200,
        discount: 300,
        performedBy: stylist.id,
      },
    ],
  });
  await prisma.orderProductItem.create({
    data: {
      orderId: order1.id,
      productId: (await prisma.product.findFirst({ where: { name: { contains: "保濕洗髮精" } } }))!.id,
      productName: "保濕洗髮精 300ml",
      brand: "BONITA",
      quantity: 1,
      unitPrice: 450,
      subtotal: 450,
    },
  });

  // News
  await prisma.news.createMany({
    data: [
      {
        title: "四月份優惠活動開跑！",
        content: "即日起至四月底，染燙全面 85 折優惠，歡迎預約體驗！",
        isPublished: true,
        publishedAt: new Date("2026-04-01"),
        createdBy: owner.id,
      },
      {
        title: "母親節寵愛媽咪專案",
        content: "母親節期間，陪同媽媽一起來做造型，可享第二位半價優惠。",
        isPublished: true,
        publishedAt: new Date("2026-04-08"),
        createdBy: owner.id,
      },
      {
        title: "五月份公休公告",
        content: "五月一日（四）勞動節本店公休一天，造成不便敬請見諒。",
        isPublished: false,
        createdBy: owner.id,
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
