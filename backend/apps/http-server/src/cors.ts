import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const corsOptions: CorsOptions = {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
};

export default corsOptions;