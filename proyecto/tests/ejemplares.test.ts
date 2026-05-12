import request from "supertest";
import { app } from "../src/app";

describe("ejemplares", () => {
  it("crea ejemplar asociado a un libro existente", async () => {
    const response = await request(app)
      .post("/libros/lib-001/ejemplares")
      .send({ codigo_ejemplar: "ALG-001-C" })
      .expect(201);

    expect(response.body.data.estado).toBe("DISPONIBLE");
  });

  it("actualiza estado de ejemplar", async () => {
    const response = await request(app)
      .put("/ejemplares/eje-001")
      .send({ estado: "MANTENIMIENTO", observaciones: "Revision fisica" })
      .expect(200);

    expect(response.body.data.estado).toBe("MANTENIMIENTO");
  });
});
