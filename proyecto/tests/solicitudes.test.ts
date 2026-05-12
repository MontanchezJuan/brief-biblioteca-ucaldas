import request from "supertest";
import { app } from "../src/app";

describe("solicitudes", () => {
  it("crea solicitud pendiente", async () => {
    const response = await request(app)
      .post("/solicitudes")
      .send({ estudiante_id: "est-001", libro_id: "lib-001" })
      .expect(201);

    expect(response.body.data.estado).toBe("PENDIENTE");
  });

  it("bloquea solicitud duplicada pendiente", async () => {
    await request(app).post("/solicitudes").send({ estudiante_id: "est-001", libro_id: "lib-001" }).expect(201);

    const response = await request(app)
      .post("/solicitudes")
      .send({ estudiante_id: "est-001", libro_id: "lib-001" })
      .expect(409);

    expect(response.body.error).toBe("solicitud_duplicada");
  });

  it("bloquea renovacion cuando hay solicitud pendiente del libro", async () => {
    const prestamo = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    await request(app).post("/solicitudes").send({ estudiante_id: "est-002", libro_id: "lib-001" }).expect(201);

    const response = await request(app).post(`/prestamos/${prestamo.body.data.id}/renovar`).send({}).expect(409);

    expect(response.body.error).toBe("renovacion_bloqueada_por_solicitud");
  });
});
