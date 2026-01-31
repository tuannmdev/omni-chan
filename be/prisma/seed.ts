/**
 * Database Seeding Script
 * Populates database with initial data for development/testing
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Starting database seeding...");

  // Create owner user
  const ownerPassword = await bcrypt.hash("password123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@omnichan.com" },
    update: {},
    create: {
      email: "owner@omnichan.com",
      passwordHash: ownerPassword,
      name: "Admin Owner",
      role: "owner",
      planType: "enterprise",
      emailVerified: true,
    },
  });
  console.log("✅ Created owner user:", owner.email);

  // Create admin user
  const adminPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@omnichan.com" },
    update: {},
    create: {
      email: "admin@omnichan.com",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "admin",
      planType: "professional",
      emailVerified: true,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create agent user
  const agentPassword = await bcrypt.hash("password123", 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent@omnichan.com" },
    update: {},
    create: {
      email: "agent@omnichan.com",
      passwordHash: agentPassword,
      name: "Support Agent",
      role: "agent",
      planType: "starter",
      emailVerified: true,
    },
  });
  console.log("✅ Created agent user:", agent.email);

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      userId: owner.id,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      facebookId: "fb_123456",
      customerSegment: "vip",
      totalOrders: 15,
      totalOrderValue: 25000000,
      customerLifetimeValue: 30000000,
    },
  });
  console.log("✅ Created customer:", customer1.name);

  const customer2 = await prisma.customer.create({
    data: {
      userId: owner.id,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0907654321",
      facebookId: "fb_789012",
      customerSegment: "regular",
      totalOrders: 5,
      totalOrderValue: 5000000,
      customerLifetimeValue: 6000000,
    },
  });
  console.log("✅ Created customer:", customer2.name);

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      userId: owner.id,
      name: "Áo thun nam basic",
      description: "Áo thun nam chất liệu cotton, nhiều màu sắc",
      category: "fashion",
      subcategory: "men",
      sku: "ATNAM001",
      price: 199000,
      salePrice: 149000,
      stockQuantity: 500,
      isAvailable: true,
      brand: "Local Brand",
      tags: ["áo thun", "nam", "basic"],
      images: ["https://example.com/image1.jpg"],
    },
  });
  console.log("✅ Created product:", product1.name);

  const product2 = await prisma.product.create({
    data: {
      userId: owner.id,
      name: "Quần jean nữ skinny",
      description: "Quần jean nữ form skinny, co giãn tốt",
      category: "fashion",
      subcategory: "women",
      sku: "QJNU001",
      price: 399000,
      salePrice: 299000,
      stockQuantity: 300,
      isAvailable: true,
      brand: "Local Brand",
      tags: ["quần jean", "nữ", "skinny"],
      images: ["https://example.com/image2.jpg"],
    },
  });
  console.log("✅ Created product:", product2.name);

  // Create AI configuration
  const aiConfig = await prisma.aiConfiguration.create({
    data: {
      userId: owner.id,
      name: "Default Configuration",
      description: "Default AI configuration for Vietnamese e-commerce",
      isActive: true,
      modelProvider: "openai",
      modelName: "gpt-4",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: "Bạn là trợ lý AI chuyên nghiệp cho dịch vụ chăm sóc khách hàng thương mại điện tử Việt Nam.",
      enableSentimentAnalysis: true,
      enableIntentDetection: true,
    },
  });
  console.log("✅ Created AI configuration:", aiConfig.name);

  console.log("🎉 Database seeding completed!");
  console.log("\n📝 Test credentials:");
  console.log("Owner:  owner@omnichan.com / password123");
  console.log("Admin:  admin@omnichan.com / password123");
  console.log("Agent:  agent@omnichan.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
