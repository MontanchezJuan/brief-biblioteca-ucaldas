import request from "supertest";
import { app } from "../src/app";

describe("libros", () => {
  it("lista libros con disponibilidad", async () => {
    const response = await request(app).get("/libros").expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty("ejemplares_disponibles");
  });

  it("crea un libro y calcula dias de prestamo", async () => {
    const response = await request(app)
      .post("/libros")
      .send({
        codigo_inventario: "BIB-FIS-001",
        titulo: "Fisica universitaria",
        autor: "Sonia Castro",
        sala: "Ciencias exactas",
        alta_demanda: true
      })
      .expect(201);

    expect(response.body.data.dias_prestamo).toBe(3);
  });

  it("rechaza codigo de inventario duplicado", async () => {
    await request(app)
      .post("/libros")
      .send({
        codigo_inventario: "BIB-ALG-001",
        titulo: "Duplicado",
        autor: "Autor",
        sala: "Ingenieria",
        alta_demanda: false
      })
      .expect(409);
  });

  it("no elimina libros con ejemplares asociados", async () => {
    const response = await request(app).delete("/libros/lib-001").expect(409);

    expect(response.body.error).toBe("libro_con_ejemplares");
  });
});
