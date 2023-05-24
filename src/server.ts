import express, { json } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();

app.use(json());

app.use(cors());

// rotas

interface transactionProps {
    
    description: string,
    amount : number,
    date: string,
    
}

const prisma = new PrismaClient();

app.get('/', async (request,response)=>{

    const transaction = await prisma.transaction.findMany();

    return response.status(200).json(transaction)
})

app.post('/', async (request,response)=>{

    const body:transactionProps = request.body;

    const transaction = await prisma.transaction.create({
        data:{
            description: body.description,
            amount: body.amount,
            date: body.date
        }
    })
    if (transaction){
        return response.status(201).json(transaction)
    }else{
        return response.status(400)
    }
    
})

app.delete('/:id', async (request,response)=>{
    const id:number = parseInt(request.params.id);
    const transaction = await prisma.transaction.delete({
        where:{
            id
        }
    
    });
    
    return response.status(201).json(transaction)
})


// listen

app.listen(3333,()=>{
    console.log('rodando')
})